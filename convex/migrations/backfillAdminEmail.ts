import { internalMutation } from "../_generated/server";

/**
 * One-off migration: Add email field to existing salon admins
 * where the username is already an email address.
 */
export const backfillAdminEmail = internalMutation({
  args: {},
  handler: async (ctx) => {
    const salons = await ctx.db.query("salons").collect();
    let updated = 0;

    for (const salon of salons) {
      if (!salon.admins) continue;

      const needsUpdate = salon.admins.some((a) => !a.email);
      if (!needsUpdate) continue;

      const updatedAdmins = salon.admins.map((a) => ({
        ...a,
        email: a.email ?? a.username, // username was used as email before
      }));

      await ctx.db.patch(salon._id, { admins: updatedAdmins });
      updated++;
    }

    return { updated };
  },
});
