import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Sunday 10am MYT (2am UTC)
crons.cron("sunday pulse", "0 2 * * 0", internal.scheduled.pulse.generateAndSend, {});

// 1st of each month 10am MYT (2am UTC)
crons.cron("monthly routine", "0 2 1 * *", internal.scheduled.monthlyRoutine.sendNudges, {});

// Every 6 hours: reset stuck conversations
crons.interval("cleanup stale conversations", { hours: 6 }, internal.scheduled.cleanup.resetStale, {});

export default crons;
