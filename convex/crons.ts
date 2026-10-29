import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Refresh the catalog twice daily. The sync action uses public Radio Browser
// mirrors and writes bounded batches into the indexed Convex stations table.
crons.interval("sync Radio Browser catalog", { hours: 12 }, internal.stations.syncTopStations, {});

export default crons;
