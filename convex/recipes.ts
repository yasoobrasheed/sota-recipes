import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return recipes.map((recipe) => ({
      _id: recipe._id,
      name: recipe.name,
      imageUrl: recipe.imageUrl,
    }));
  },
});

export const get = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    ingredients: v.array(v.string()),
    instructions: v.array(v.string()),
    webRefUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("recipes", args);
  },
});
