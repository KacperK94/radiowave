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
  stations: defineTable({
    stationUuid: v.string(),
    name: v.string(),
    searchText: v.string(),
    streamUrl: v.string(),
    homepage: v.optional(v.string()),
    favicon: v.optional(v.string()),
    country: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    state: v.optional(v.string()),
    languages: v.array(v.string()),
    tags: v.array(v.string()),
    codec: v.optional(v.string()),
    bitrate: v.number(),
    votes: v.number(),
    clickCount: v.number(),
    lastCheckOk: v.boolean(),
    lastCheckTime: v.number(),
    source: v.string(),
    importedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_stationUuid", ["stationUuid"])
    .index("by_countryCode", ["countryCode"])
    .index("by_clickCount", ["clickCount"])
    .searchIndex("search_station_text", {
      searchField: "searchText",
      filterFields: ["countryCode"],
    }),
});
