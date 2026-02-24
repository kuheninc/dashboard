import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * After sign-up, automatically link the user to any salon where their email
 * appears in the admins array. Called from the dashboard when the user has
 * no salon memberships yet.
 */
export const autoLinkUserToSalon = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { linked: false };

    // Check if user already has memberships
    const existing = await ctx.db
      .query("salonMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) return { linked: true, salonId: existing.salonId };

    // Get the user's email from the auth users table
    const user = await ctx.db.get(userId);
    if (!user?.email) return { linked: false };

    const email = user.email.toLowerCase();

    // Search all active salons for an admin email match
    const salons = await ctx.db
      .query("salons")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();

    for (const salon of salons) {
      if (!salon.admins) continue;
      const matchedAdmin = salon.admins.find(
        (a) => a.email?.toLowerCase() === email || a.username?.toLowerCase() === email
      );
      if (matchedAdmin) {
        const membershipId = await ctx.db.insert("salonMembers", {
          userId,
          salonId: salon._id,
          role: matchedAdmin.role,
        });
        return { linked: true, salonId: salon._id, membershipId };
      }
    }

    return { linked: false };
  },
});
