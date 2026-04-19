import { NextRequest } from 'next/server'
import * as cheerio from 'cheerio'
import { fetchMutation } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

export async function POST(request: NextRequest) {
  let url: string
  let userId: Id<'users'>
  try {
    const body = await request.json()
    url = body?.url
    userId = body?.userId
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!userId) {
    return Response.json({ error: 'userId is required' }, { status: 400 })
  }

  if (!url || typeof url !== 'string') {
    return Response.json({ error: 'URL is required' }, { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return Response.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return Response.json({ error: 'Only HTTP/HTTPS URLs are supported' }, { status: 400 })
  }

  let html: string
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RecipeParser/1.0)' },
    })
    if (!response.ok) {
      return Response.json({ error: `Failed to fetch page (${response.status})` }, { status: 400 })
    }
    html = await response.text()
  } catch {
    return Response.json({ error: 'Failed to fetch the page' }, { status: 400 })
  }

  const result = extractFromJsonLd(html) ?? extractFromHtml(html)

  if (!result) {
    return Response.json(
      { error: 'Could not find recipe data on this page' },
      { status: 422 },
    )
  }

  let recipeId: Id<'recipes'>
  try {
    recipeId = await fetchMutation(api.recipes.create, {
      userId,
      name: result.name,
      ingredients: result.ingredients,
      instructions: result.steps,
      webRefUrl: url,
    })
  } catch (err) {
    console.error('[parse-recipe] Convex create failed:', err)
    return Response.json(
      { error: `Failed to save recipe: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 },
    )
  }

  return Response.json({ ...result, id: recipeId })
}

// --- Helpers ---

type ParsedRecipe = {
  name: string
  ingredients: string[]
  steps: string[]
}

// --- JSON-LD (schema.org Recipe) extraction ---

function extractFromJsonLd(html: string): ParsedRecipe | null {
  const scriptRegex =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match: RegExpExecArray | null

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const data: unknown = JSON.parse(match[1])
      const recipe = findRecipe(data)
      if (recipe) {
        const name = extractName(recipe)
        const ingredients = extractIngredients(recipe)
        const steps = extractSteps(recipe)
        if (ingredients.length || steps.length) {
          return { name, ingredients, steps }
        }
      }
    } catch {
      // malformed JSON — try next script tag
    }
  }

  return null
}

function findRecipe(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null

  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findRecipe(item)
      if (found) return found
    }
    return null
  }

  const obj = data as Record<string, unknown>

  const type = obj['@type']
  if (type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))) {
    return obj
  }

  if (Array.isArray(obj['@graph'])) {
    for (const item of obj['@graph'] as unknown[]) {
      const found = findRecipe(item)
      if (found) return found
    }
  }

  return null
}

function extractName(recipe: Record<string, unknown>): string {
  return typeof recipe['name'] === 'string' ? recipe['name'].trim() : ''
}

function extractIngredients(recipe: Record<string, unknown>): string[] {
  const raw = recipe['recipeIngredient']
  if (!Array.isArray(raw)) return []
  return raw.filter((item): item is string => typeof item === 'string')
}

function extractSteps(recipe: Record<string, unknown>): string[] {
  const raw = recipe['recipeInstructions']
  if (!raw) return []
  if (typeof raw === 'string') return raw.trim() ? [raw.trim()] : []

  if (Array.isArray(raw)) {
    return raw.flatMap((step) => {
      if (typeof step === 'string') return step.trim() ? [step.trim()] : []
      if (typeof step === 'object' && step !== null) {
        const s = step as Record<string, unknown>
        if (typeof s['text'] === 'string') return s['text'].trim() ? [s['text'].trim()] : []
        if (Array.isArray(s['itemListElement'])) {
          return (s['itemListElement'] as unknown[]).flatMap((item) => {
            if (typeof item === 'object' && item !== null) {
              const i = item as Record<string, unknown>
              if (typeof i['text'] === 'string') return i['text'].trim() ? [i['text'].trim()] : []
            }
            return []
          })
        }
      }
      return []
    })
  }

  return []
}

// --- HTML microdata fallback ---

function extractFromHtml(html: string): ParsedRecipe | null {
  const $ = cheerio.load(html)

  const name =
    $('[itemprop="name"]').first().text().trim() ||
    $('h1').first().text().trim()

  const ingredients: string[] = []
  $('[itemprop="recipeIngredient"]').each((_, el) => {
    const text = $(el).text().trim()
    if (text) ingredients.push(text)
  })

  const steps: string[] = []
  $('[itemprop="recipeInstructions"] [itemprop="text"]').each((_, el) => {
    const text = $(el).text().trim()
    if (text) steps.push(text)
  })

  if (!steps.length) {
    $('[itemprop="recipeInstructions"]').each((_, el) => {
      const text = $(el).text().trim()
      if (text) steps.push(text)
    })
  }

  if (ingredients.length || steps.length) {
    return { name, ingredients, steps }
  }

  return null
}
