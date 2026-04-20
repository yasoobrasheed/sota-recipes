import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export type Serving = {
  common: { unit: string; quantity: number };
  metric: { unit: string; quantity: number };
};

export type Nutrition100g = {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  total_fat?: number;
  dietary_fiber?: number;
  total_sugars?: number;
  sodium?: number;
  saturated_fats?: number;
  cholesterol?: number;
  [key: string]: number | undefined;
};

export type NutritionRow = {
  id: string;
  name: string;
  alternate_names: string[] | null;
  ean_13: string | null;
  serving: Serving;
  nutrition_100g: Nutrition100g;
};

// Sanitize a search term for use in an FTS5 MATCH expression
function ftsEscape(term: string): string {
  return `"${term.replace(/"/g, '""')}"`;
}

export async function findIngredient(
  name: string,
): Promise<NutritionRow | null> {
  const result = await client.execute({
    sql: `SELECT n.id, n.name, n.alternate_names, n.ean_13, n.serving, n.nutrition_100g
          FROM nutrition_fts
          JOIN nutrition n ON n.rowid = nutrition_fts.rowid
          WHERE nutrition_fts MATCH ?
          ORDER BY rank
          LIMIT 1`,
    args: [ftsEscape(name)],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id as string,
    name: row.name as string,
    alternate_names: row.alternate_names
      ? JSON.parse(row.alternate_names as string)
      : null,
    ean_13: row.ean_13 as string | null,
    serving: JSON.parse(row.serving as string),
    nutrition_100g: JSON.parse(row.nutrition_100g as string),
  };
}
