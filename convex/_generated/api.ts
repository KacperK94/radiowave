/* eslint-disable */
/**
 * Generated API bindings for the RadioWave Convex modules.
 * Keep this file in source control so frontend builds do not need deployment credentials.
 */
import type * as shoutbox from "../shoutbox";
import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";

declare const fullApi: ApiFromModules<{ shoutbox: typeof shoutbox }>;
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;
