import { notFound } from "next/navigation";
import Link from "next/link";
import { findIngredient, type Nutrition100g } from "@/lib/nutrition";

const UNITS =
  /^(cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|g|grams?|kg|lbs?|pounds?|ml|l|cloves?|slices?|pieces?|whole|large|medium|small|bunch|cans?|jars?)\s+/i;

const QUANTITY = /^\s*[\d/.\s\u00BC-\u00BE\u2150-\u215E]+/;

function extractName(ingredient: string): string {
  return ingredient
    .split(",")[0]
    .replace(QUANTITY, "")
    .replace(UNITS, "")
    .trim();
}

const MACROS: { key: keyof Nutrition100g; label: string; unit: string }[] = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbohydrates", label: "Carbohydrates", unit: "g" },
  { key: "total_fat", label: "Fat", unit: "g" },
  { key: "dietary_fiber", label: "Fiber", unit: "g" },
  { key: "total_sugars", label: "Sugars", unit: "g" },
];

function fmt(value: number | undefined): string {
  if (value === undefined || value === null) return "—";
  return value % 1 === 0 ? String(value) : value.toFixed(1);
}

export default async function IngredientPage({
  params,
}: {
  params: Promise<{ user_id: string; recipe: string; ingredient: string }>;
}) {
  const { user_id, recipe, ingredient } = await params;
  const searchTerm = extractName(decodeURIComponent(ingredient));

  if (!searchTerm) notFound();

  const data = await findIngredient(searchTerm).catch(() => null);

  if (!data) notFound();

  const otherNutrients = Object.entries(data.nutrition_100g).filter(
    ([key]) => !MACROS.some((m) => m.key === key),
  );

  return (
    <main
      className="mx-auto w-full max-w-md p-6"
      style={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}
    >
      <Link href={`/${user_id}/recipes/${recipe}`} className="text-sm underline underline-offset-2">
        ← Back
      </Link>

      <h1 className="mt-4 text-2xl font-semibold">{data.name}</h1>
      <p className="mt-1 text-sm text-gray-500">Per 100g</p>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Nutrition</h2>
        <ul className="mt-3 divide-y divide-gray-200">
          {MACROS.map(({ key, label, unit }) => (
            <li key={key} className="flex justify-between py-2 text-sm">
              <span>{label}</span>
              <span className="font-medium">
                {fmt(data.nutrition_100g[key])} {unit}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {otherNutrients.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">All Nutrients</h2>
          <ul className="mt-3 divide-y divide-gray-200">
            {otherNutrients.map(([key, value]) => (
              <li key={key} className="flex justify-between py-2 text-sm">
                <span className="capitalize">{key.replace(/_/g, " ")}</span>
                <span className="font-medium">{fmt(value)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 text-xs text-gray-400">
        Nutrition data from{" "}
        <a
          href="https://www.opennutrition.app"
          className="underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenNutrition
        </a>
      </p>
    </main>
  );
}
