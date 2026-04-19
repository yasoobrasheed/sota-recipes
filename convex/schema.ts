import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    imageUrl: v.optional(v.string()),
  }),
  recipes: defineTable({
    userId: v.id("users"),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    ingredients: v.array(v.string()),
    instructions: v.array(v.string()),
    webRefUrl: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});
