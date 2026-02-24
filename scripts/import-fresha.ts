#!/usr/bin/env npx tsx

/**
 * Import a salon's data from their public Fresha profile page.
 *
 * Usage:
 *   npx tsx scripts/import-fresha.ts "https://www.fresha.com/a/salon-name-city-xxxxx"
 *   npx tsx scripts/import-fresha.ts "https://www.fresha.com/a/..." --dry-run
 *
 * What it does:
 *   1. Fetches the Fresha page (plain HTTP — no headless browser needed)
 *   2. Extracts JSON-LD structured data (schema.org HealthAndBeautyBusiness)
 *   3. Maps services, stylists, and hours to Cadence schema
 *   4. Inserts everything into Convex via public mutations
 *
 * What you still need to add manually after import:
 *   - WhatsApp API credentials (waPhoneNumberId, waBusinessAccountId, waAccessToken)
 *   - Admin accounts (username, password, phone, role)
 *   - Stylist per-day availability (defaults to salon hours)
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("Missing NEXT_PUBLIC_CONVEX_URL. Run from the project root or set it.");
  process.exit(1);
}

const freshaUrl = process.argv[2];
if (!freshaUrl || !freshaUrl.includes("fresha.com/a/")) {
  console.error("Usage: npx tsx scripts/import-fresha.ts <fresha-salon-url>");
  console.error('Example: npx tsx scripts/import-fresha.ts "https://www.fresha.com/a/yoje-hair-salon-kuala-lumpur-49-jalan-telawi-3-y9bzea53"');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Types (matching actual Fresha JSON-LD structure)
// ---------------------------------------------------------------------------

interface FreshaService {
  "@type": "Service";
  name?: string;
  price?: number;
  priceCurrency?: string;
}

interface FreshaOfferCatalog {
  "@type": "OfferCatalog";
  name?: string; // category name
  itemListElement?: Array<{
    "@type": "Offer";
    itemOffered?: FreshaService;
  }>;
}

interface FreshaJsonLd {
  "@type": string | string[];
  name?: string;
  address?: string; // plain string in Fresha
  telephone?: string;
  openingHours?: string[]; // e.g. ["Mo 10:00-18:00", "Tu 10:00-18:00"]
  hasOfferCatalog?: FreshaOfferCatalog[];
  employee?: Array<{ name?: string }>;
  geo?: { latitude?: number; longitude?: number };
  aggregateRating?: { ratingValue?: number; reviewCount?: number };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Decode HTML entities like &amp; → & */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

/** Map 2-letter day abbreviation to day number (0=Sun, 1=Mon, ..., 6=Sat). */
const SHORT_DAY_MAP: Record<string, number> = {
  Su: 0, Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6,
};

/** Clean salon name — strip " - Address - City | Fresha" suffix. */
function cleanSalonName(raw: string): string {
  // Fresha format: "Salon Name - Street - City | Fresha"
  const pipeIdx = raw.indexOf(" | Fresha");
  const cleaned = pipeIdx > 0 ? raw.slice(0, pipeIdx) : raw;
  // Take only the first segment before " - " (the actual salon name)
  const dashIdx = cleaned.indexOf(" - ");
  return dashIdx > 0 ? cleaned.slice(0, dashIdx) : cleaned;
}

/** Parse duration caption like "30 mins", "1 hr", "1 hr 30 mins" to minutes. */
function parseCaptionDuration(caption: string | undefined | null): number {
  if (!caption) return 60;
  const hrMatch = caption.match(/(\d+)\s*hr/);
  const minMatch = caption.match(/(\d+)\s*min/);
  const hours = hrMatch ? parseInt(hrMatch[1], 10) : 0;
  const minutes = minMatch ? parseInt(minMatch[1], 10) : 0;
  return (hours * 60 + minutes) || 60;
}

/** Deduplicate services by name (keep first occurrence — usually from "Featured"). */
function dedupeServices(services: ParsedService[]): ParsedService[] {
  const seen = new Set<string>();
  const result: ParsedService[] = [];
  for (const svc of services) {
    const key = svc.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(svc);
    }
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractNextData(html: string): any | null {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

interface ParsedService {
  name: string;
  priceRM: number;
  durationMinutes: number;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\nFetching ${freshaUrl} ...\n`);

  const res = await fetch(freshaUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html",
    },
  });

  if (!res.ok) {
    console.error(`Failed to fetch page: ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const html = await res.text();

  // Extract all JSON-LD blocks
  const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  const jsonLdBlocks: unknown[] = [];
  let match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      jsonLdBlocks.push(JSON.parse(match[1]));
    } catch {
      // skip malformed JSON-LD
    }
  }

  if (jsonLdBlocks.length === 0) {
    console.error("No JSON-LD structured data found on this page.");
    process.exit(1);
  }

  // Find the business entity
  const businessTypes = [
    "HealthAndBeautyBusiness",
    "HairSalon",
    "BeautySalon",
    "LocalBusiness",
  ];

  let biz: FreshaJsonLd | undefined;
  for (const block of jsonLdBlocks) {
    const items = Array.isArray(block) ? block : [block];
    for (const item of items) {
      const type = (item as Record<string, unknown>)["@type"];
      const types = Array.isArray(type) ? type : [type];
      if (types.some((t: string) => businessTypes.includes(t))) {
        biz = item as FreshaJsonLd;
        break;
      }
    }
    if (biz) break;
  }

  if (!biz) {
    console.error("Could not find a salon/business entity in the JSON-LD data.");
    process.exit(1);
  }

  // -------------------------------------------------------------------------
  // Parse salon info
  // -------------------------------------------------------------------------

  const salonName = cleanSalonName(biz.name || "Unknown Salon");
  const address = typeof biz.address === "string" ? biz.address : "Address not found";

  console.log(`Salon: ${salonName}`);
  console.log(`Address: ${address}`);
  if (biz.telephone) console.log(`Phone: ${biz.telephone}`);
  if (biz.aggregateRating) {
    console.log(`Rating: ${biz.aggregateRating.ratingValue}/5 (${biz.aggregateRating.reviewCount} reviews)`);
  }

  // -------------------------------------------------------------------------
  // Parse opening hours — format: ["Mo 10:00-18:00", "Tu 10:00-18:00", ...]
  // -------------------------------------------------------------------------

  const allDays = [0, 1, 2, 3, 4, 5, 6]; // Sun-Sat
  const openDays = new Map<number, { open: string; close: string }>();

  if (biz.openingHours && Array.isArray(biz.openingHours)) {
    for (const entry of biz.openingHours) {
      // Format: "Mo 10:00-18:00" or "Mo,Tu 10:00-18:00"
      const parts = entry.match(/^([A-Za-z,]+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);
      if (!parts) continue;
      const daysPart = parts[1];
      const open = parts[2].padStart(5, "0"); // "9:00" → "09:00"
      const close = parts[3].padStart(5, "0");

      // Handle comma-separated days
      for (const d of daysPart.split(",")) {
        const dayNum = SHORT_DAY_MAP[d.trim()];
        if (dayNum !== undefined) {
          openDays.set(dayNum, { open, close });
        }
      }
    }
  }

  const openingHours = allDays.map((day) => {
    const hours = openDays.get(day);
    return hours
      ? { day, open: hours.open, close: hours.close, isClosed: false }
      : { day, open: "00:00", close: "00:00", isClosed: true };
  });

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const openDayNames = openingHours
    .filter((h) => !h.isClosed)
    .map((h) => dayNames[h.day])
    .join(", ");
  const closedDayNames = openingHours
    .filter((h) => h.isClosed)
    .map((h) => dayNames[h.day])
    .join(", ");

  console.log(`Open: ${openDayNames || "none found"}`);
  if (closedDayNames) console.log(`Closed: ${closedDayNames}`);

  // -------------------------------------------------------------------------
  // Extract __NEXT_DATA__ for richer data (durations + stylists)
  // -------------------------------------------------------------------------

  const nextData = extractNextData(html);

  // Build a duration map from __NEXT_DATA__ → props.pageProps.data.location.services
  const durationMap = new Map<string, number>();
  if (nextData) {
    const svcCategories = nextData?.props?.pageProps?.data?.location?.services;
    if (Array.isArray(svcCategories)) {
      for (const cat of svcCategories) {
        for (const item of cat.items || []) {
          if (item.name && item.caption) {
            durationMap.set(
              decodeHtmlEntities(item.name).toLowerCase(),
              parseCaptionDuration(item.caption)
            );
          }
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Parse services — hasOfferCatalog is an array of OfferCatalog objects
  // -------------------------------------------------------------------------

  let services: ParsedService[] = [];

  if (Array.isArray(biz.hasOfferCatalog)) {
    for (const catalog of biz.hasOfferCatalog) {
      if (!catalog.itemListElement) continue;
      for (const offer of catalog.itemListElement) {
        const svc = offer.itemOffered;
        if (!svc?.name) continue;
        const name = decodeHtmlEntities(svc.name);
        services.push({
          name,
          priceRM: svc.price ?? 0,
          durationMinutes: durationMap.get(name.toLowerCase()) ?? 60,
        });
      }
    }
  }

  // Deduplicate (Featured category repeats services from other categories)
  services = dedupeServices(services);

  console.log(`Services: ${services.length}`);

  // -------------------------------------------------------------------------
  // Parse team / stylists from __NEXT_DATA__ employeeProfiles
  // -------------------------------------------------------------------------

  const stylistNames: string[] = [];

  // Primary: __NEXT_DATA__ → props.pageProps.data.location.employeeProfiles.edges
  if (nextData) {
    const edges = nextData?.props?.pageProps?.data?.location?.employeeProfiles?.edges;
    if (Array.isArray(edges)) {
      for (const edge of edges) {
        const name = edge?.node?.displayName;
        if (name && !stylistNames.includes(name)) {
          stylistNames.push(name);
        }
      }
    }
  }

  // Fallback: JSON-LD employee array
  if (stylistNames.length === 0 && biz.employee && Array.isArray(biz.employee)) {
    for (const emp of biz.employee) {
      if (emp.name) stylistNames.push(emp.name);
    }
  }

  console.log(`Stylists: ${stylistNames.length} (${stylistNames.join(", ") || "none found"})`);

  // -------------------------------------------------------------------------
  // Preview
  // -------------------------------------------------------------------------

  console.log("\n--- Preview ---");
  console.log(`Salon:    ${salonName}`);
  console.log(`Address:  ${address}`);
  console.log(`Hours:    ${openDayNames}${closedDayNames ? ` | Closed: ${closedDayNames}` : ""}`);
  console.log(`Services: ${services.length}`);
  console.log(`Stylists: ${stylistNames.length}`);

  if (services.length > 0) {
    console.log("\nServices:");
    for (const s of services.slice(0, 15)) {
      console.log(`  - ${s.name}: RM${s.priceRM} (${s.durationMinutes} min)`);
    }
    if (services.length > 15) {
      console.log(`  ... and ${services.length - 15} more`);
    }
  }

  // Check for --dry-run flag
  if (process.argv.includes("--dry-run")) {
    console.log("\n--dry-run flag set. Skipping database insert.");
    process.exit(0);
  }

  // -------------------------------------------------------------------------
  // Insert into Convex
  // -------------------------------------------------------------------------

  console.log("\nInserting into Convex...");

  const client = new ConvexHttpClient(CONVEX_URL);

  // 1. Create salon
  const salonId = await client.mutation(api.salons.mutations.createFromImport, {
    name: salonName,
    address,
    openingHours,
    timezone: "Asia/Kuala_Lumpur",
  });

  console.log(`  + Salon created: ${salonId}`);

  // 2. Create services
  let serviceCount = 0;
  for (const svc of services) {
    await client.mutation(api.services.mutations.create, {
      salonId,
      name: svc.name,
      durationMinutes: svc.durationMinutes,
      priceRM: svc.priceRM,
    });
    serviceCount++;
  }
  console.log(`  + ${serviceCount} services created`);

  // 3. Create stylists (availability defaults to salon open hours)
  const defaultAvailability = openingHours
    .filter((h) => !h.isClosed)
    .map((h) => ({
      day: h.day,
      startTime: h.open,
      endTime: h.close,
    }));

  let stylistCount = 0;
  for (const name of stylistNames) {
    await client.mutation(api.stylists.mutations.create, {
      salonId,
      name,
      availability: defaultAvailability,
    });
    stylistCount++;
  }
  console.log(`  + ${stylistCount} stylists created`);

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------

  console.log("\n========================================");
  console.log("  Import complete!");
  console.log("========================================");
  console.log(`  Salon:    ${salonName}`);
  console.log(`  Services: ${serviceCount}`);
  console.log(`  Stylists: ${stylistCount}`);
  console.log(`  Salon ID: ${salonId}`);
  console.log("");
  console.log("  Still needed:");
  console.log("    - WhatsApp API credentials");
  console.log("    - Admin accounts");
  console.log("    - Review stylist availability (defaulted to salon hours)");
  console.log("    - Review service durations (from Fresha captions)");
  console.log("========================================\n");
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
