/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_prompts from "../ai/prompts.js";
import type * as ai_router from "../ai/router.js";
import type * as ai_tools from "../ai/tools.js";
import type * as bookings_internal from "../bookings/internal.js";
import type * as bookings_mutations from "../bookings/mutations.js";
import type * as bookings_queries from "../bookings/queries.js";
import type * as calendar_mutations from "../calendar/mutations.js";
import type * as calendar_sync from "../calendar/sync.js";
import type * as conversations_internal from "../conversations/internal.js";
import type * as conversations_mutations from "../conversations/mutations.js";
import type * as conversations_queries from "../conversations/queries.js";
import type * as crons from "../crons.js";
import type * as customers_internal from "../customers/internal.js";
import type * as customers_mutations from "../customers/mutations.js";
import type * as customers_queries from "../customers/queries.js";
import type * as http from "../http.js";
import type * as messages_internal from "../messages/internal.js";
import type * as messages_mutations from "../messages/mutations.js";
import type * as messages_queries from "../messages/queries.js";
import type * as salons_internal from "../salons/internal.js";
import type * as salons_mutations from "../salons/mutations.js";
import type * as salons_queries from "../salons/queries.js";
import type * as scheduled_checkins from "../scheduled/checkins.js";
import type * as scheduled_cleanup from "../scheduled/cleanup.js";
import type * as scheduled_monthlyRoutine from "../scheduled/monthlyRoutine.js";
import type * as scheduled_pulse from "../scheduled/pulse.js";
import type * as scheduled_reminders from "../scheduled/reminders.js";
import type * as services_internal from "../services/internal.js";
import type * as services_mutations from "../services/mutations.js";
import type * as services_queries from "../services/queries.js";
import type * as stylists_internal from "../stylists/internal.js";
import type * as stylists_mutations from "../stylists/mutations.js";
import type * as stylists_queries from "../stylists/queries.js";
import type * as whatsapp_send from "../whatsapp/send.js";
import type * as whatsapp_webhook from "../whatsapp/webhook.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/prompts": typeof ai_prompts;
  "ai/router": typeof ai_router;
  "ai/tools": typeof ai_tools;
  "bookings/internal": typeof bookings_internal;
  "bookings/mutations": typeof bookings_mutations;
  "bookings/queries": typeof bookings_queries;
  "calendar/mutations": typeof calendar_mutations;
  "calendar/sync": typeof calendar_sync;
  "conversations/internal": typeof conversations_internal;
  "conversations/mutations": typeof conversations_mutations;
  "conversations/queries": typeof conversations_queries;
  crons: typeof crons;
  "customers/internal": typeof customers_internal;
  "customers/mutations": typeof customers_mutations;
  "customers/queries": typeof customers_queries;
  http: typeof http;
  "messages/internal": typeof messages_internal;
  "messages/mutations": typeof messages_mutations;
  "messages/queries": typeof messages_queries;
  "salons/internal": typeof salons_internal;
  "salons/mutations": typeof salons_mutations;
  "salons/queries": typeof salons_queries;
  "scheduled/checkins": typeof scheduled_checkins;
  "scheduled/cleanup": typeof scheduled_cleanup;
  "scheduled/monthlyRoutine": typeof scheduled_monthlyRoutine;
  "scheduled/pulse": typeof scheduled_pulse;
  "scheduled/reminders": typeof scheduled_reminders;
  "services/internal": typeof services_internal;
  "services/mutations": typeof services_mutations;
  "services/queries": typeof services_queries;
  "stylists/internal": typeof stylists_internal;
  "stylists/mutations": typeof stylists_mutations;
  "stylists/queries": typeof stylists_queries;
  "whatsapp/send": typeof whatsapp_send;
  "whatsapp/webhook": typeof whatsapp_webhook;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
