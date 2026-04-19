export type Recipe = {
  slug: string;
  name: string;
  image?: string;
  ingredients: string[];
  steps: string[];
};

export type User = {
  slug: string;
  name: string;
  image?: string;
  recipes: Recipe[];
};

export const users: User[] = [
  {
    slug: "vicky",
    name: "Vicky",
    image: "/images/vicky.png",
    recipes: [
      {
        slug: "pancakes",
        name: "Pancakes",
        ingredients: [
          "1 cup flour",
          "1 egg",
          "1 cup milk",
          "1 tbsp sugar",
          "1 tsp baking powder",
        ],
        steps: [
          "Whisk dry ingredients.",
          "Add wet ingredients and mix until just combined.",
          "Cook on a hot griddle until golden on both sides.",
        ],
      },
      {
        slug: "omelette",
        name: "Omelette",
        ingredients: ["3 eggs", "1 tbsp butter", "salt", "pepper"],
        steps: [
          "Whisk eggs with salt and pepper.",
          "Melt butter in a non-stick pan over medium heat.",
          "Pour in eggs, let set, fold, and serve.",
        ],
      },
      {
        slug: "overnight-oats",
        name: "Overnight Oats",
        ingredients: [
          "1/2 cup rolled oats",
          "1/2 cup milk",
          "1 tbsp chia seeds",
          "1 tsp honey",
        ],
        steps: [
          "Combine everything in a jar.",
          "Refrigerate overnight.",
          "Top with fruit in the morning.",
        ],
      },
      {
        slug: "avocado-toast",
        name: "Avocado Toast",
        ingredients: ["2 slices bread", "1 avocado", "salt", "lemon juice"],
        steps: [
          "Toast the bread.",
          "Mash avocado with salt and lemon juice.",
          "Spread on toast and serve.",
        ],
      },
    ],
  },
  {
    slug: "yasoob",
    name: "Yasoob",
    image: "/images/yasoob.png",
    recipes: [
      {
        slug: "spaghetti-aglio-e-olio",
        name: "Spaghetti Aglio e Olio",
        ingredients: [
          "400g spaghetti",
          "6 cloves garlic, sliced",
          "1/2 cup olive oil",
          "1 tsp chili flakes",
          "parsley",
        ],
        steps: [
          "Boil spaghetti until al dente.",
          "Gently fry garlic in olive oil until golden.",
          "Toss pasta with oil, chili flakes, and parsley.",
        ],
      },
      {
        slug: "roast-chicken",
        name: "Roast Chicken",
        ingredients: [
          "1 whole chicken",
          "salt",
          "pepper",
          "1 lemon",
          "thyme",
        ],
        steps: [
          "Preheat oven to 425°F (220°C).",
          "Season chicken and stuff cavity with lemon and thyme.",
          "Roast for about 1 hour until juices run clear.",
        ],
      },
      {
        slug: "vegetable-stir-fry",
        name: "Vegetable Stir Fry",
        ingredients: [
          "mixed vegetables",
          "2 tbsp soy sauce",
          "1 tsp ginger",
          "2 cloves garlic",
          "1 tsp sesame oil",
        ],
        steps: [
          "Heat oil in a wok over high heat.",
          "Add aromatics, then vegetables.",
          "Toss with soy sauce, finish with sesame oil.",
        ],
      },
      {
        slug: "beef-tacos",
        name: "Beef Tacos",
        ingredients: [
          "500g ground beef",
          "taco seasoning",
          "8 tortillas",
          "lettuce",
          "cheese",
          "salsa",
        ],
        steps: [
          "Brown the beef in a skillet.",
          "Add seasoning and a splash of water; simmer.",
          "Fill tortillas and top as desired.",
        ],
      },
    ],
  },
];

export function getUser(slug: string): User | undefined {
  return users.find((u) => u.slug === slug);
}

export function getRecipe(
  userSlug: string,
  recipeSlug: string,
): Recipe | undefined {
  return getUser(userSlug)?.recipes.find((r) => r.slug === recipeSlug);
}
