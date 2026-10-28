/* eslint-disable */
/**
 * Generated API bindings for the RadioWave Convex modules.
 * Kept in source control so frontend builds do not need deployment credentials.
 */
import { anyApi } from "convex/server";
import type * as shoutbox from "../shoutbox";
import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";

const fullApi = anyApi as unknown as ApiFromModules<{ shoutbox: typeof shoutbox }>;
export const api = anyApi as FilterApi<typeof fullApi, FunctionReference<any, "public">>;
export const internal = anyApi as FilterApi<typeof fullApi, FunctionReference<any, "internal">>;
