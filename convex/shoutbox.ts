import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const MAX_MESSAGES = 40;
const MAX_NICKNAME_LENGTH = 24;
const MAX_MESSAGE_LENGTH = 280;
const SEND_COOLDOWN_MS = 2500;

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("shoutboxMessages")
      .withIndex("by_createdAt")
      .order("desc")
      .take(MAX_MESSAGES);
  },
});

export const send = mutation({
  args: { nickname: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const nickname = args.nickname.trim().slice(0, MAX_NICKNAME_LENGTH);
    const body = args.body.trim().slice(0, MAX_MESSAGE_LENGTH);

    if (!nickname) throw new Error("Podaj nick przed wysłaniem wiadomości.");
    if (!body) throw new Error("Wiadomość nie może być pusta.");

    const recent = await ctx.db
      .query("shoutboxMessages")
      .withIndex("by_createdAt")
      .order("desc")
      .take(20);
    const now = Date.now();
    const lastFromNick = recent.find(
      (message) => message.nickname.toLowerCase() === nickname.toLowerCase(),
    );

    if (lastFromNick && now - lastFromNick.createdAt < SEND_COOLDOWN_MS) {
      throw new Error("Odczekaj chwilę przed wysłaniem kolejnej wiadomości.");
    }

    await ctx.db.insert("shoutboxMessages", { nickname, body, createdAt: now });
  },
});
