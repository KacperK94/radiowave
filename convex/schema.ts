import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  shoutboxMessages: defineTable({
    nickname: v.string(),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
  stationSuggestions: defineTable({
    name: v.string(),
    genre: v.string(),
    streamUrl: v.string(),
    submittedBy: v.string(),
    createdAt: v.number(),
    approved: v.boolean(),
  }).index("by_createdAt", ["createdAt"]).index("by_approved", ["approved"]),
  userProfiles: defineTable({
    nickname: v.string(),
    bio: v.optional(v.string()),
    city: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_nickname", ["nickname"]),
});
