"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDashboard } from "@/lib/dashboard-context";
import { getDateRangeStr } from "@/lib/dashboard-helpers";
import StatCard from "@/components/dashboard/StatCard";
import StylistCard from "@/components/dashboard/team/StylistCard";
import AvailabilityGrid from "@/components/dashboard/team/AvailabilityGrid";
import Modal from "@/components/dashboard/Modal";
import { UserCog, CheckCircle2, Calendar, Plus } from "lucide-react";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeamPage() {
  const { salonId, stylists } = useDashboard();
  const { startDate, endDate } = useMemo(() => getDateRangeStr(30), []);
  const bookings = useQuery(api.bookings.queries.getByDateRange, { salonId, startDate, endDate });
  const [showAdd, setShowAdd] = useState(false);

  const activeStylists = stylists.filter((s) => s.isActive);
  const inactiveStylists = stylists.filter((s) => !s.isActive);

  const stylistStats = useMemo(() => {
    if (!bookings) return new Map<string, { bookings: number; completed: number; noShows: number }>();
    const map = new Map<string, { bookings: number; completed: number; noShows: number }>();
    for (const b of bookings) {
      const prev = map.get(b.stylistId) ?? { bookings: 0, completed: 0, noShows: 0 };
      prev.bookings++;
      if (b.status === "completed") prev.completed++;
      if (b.status === "no_show") prev.noShows++;
      map.set(b.stylistId, prev);
    }
    return map;
  }, [bookings]);

  const totalBookingsMonth = bookings?.length ?? 0;
  const totalCompleted = bookings?.filter((b) => b.status === "completed").length ?? 0;
  const totalNonCancelled = bookings?.filter(
    (b) => b.status !== "cancelled_customer" && b.status !== "cancelled_admin"
  ).length ?? 0;
  const avgCompletionRate = totalNonCancelled > 0
    ? Math.round((totalCompleted / totalNonCancelled) * 100)
    : 0;

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="cadence-animate cadence-delay-1">
          <StatCard label="Active Stylists" value={String(activeStylists.length)} icon={UserCog} iconColor="text-primary" />
        </div>
        <div className="cadence-animate cadence-delay-2">
          <StatCard label="Avg. Completion Rate" value={bookings ? `${avgCompletionRate}%` : "\u2014"} icon={CheckCircle2} iconColor="text-[#5a9a6e]" />
        </div>
        <div className="cadence-animate cadence-delay-3">
          <StatCard label="Total Bookings (Month)" value={bookings ? String(totalBookingsMonth) : "\u2014"} icon={Calendar} iconColor="text-[#8a7055]" />
        </div>
      </div>

      {/* Active stylist cards */}
      <div className="cadence-animate cadence-delay-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-[15px] text-foreground">Stylists</h2>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Stylist
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {activeStylists.map((stylist) => (
            <StylistCard
              key={stylist._id}
              stylist={stylist}
              stats={stylistStats.get(stylist._id)}
            />
          ))}
        </div>
      </div>

      {/* Inactive stylists */}
      {inactiveStylists.length > 0 && (
        <div className="cadence-animate cadence-delay-5">
          <h2 className="font-display text-[15px] text-[#9c9184] mb-3">Inactive Stylists</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {inactiveStylists.map((stylist) => (
              <StylistCard
                key={stylist._id}
                stylist={stylist}
                stats={stylistStats.get(stylist._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Availability grid */}
      <div className="cadence-animate cadence-delay-6">
        <AvailabilityGrid stylists={stylists} />
      </div>

      {showAdd && <AddStylistModal salonId={salonId} onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function AddStylistModal({ salonId, onClose }: { salonId: string; onClose: () => void }) {
  const createStylist = useMutation(api.stylists.mutations.create);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [availability, setAvailability] = useState<{ day: number; startTime: string; endTime: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleDay = (day: number) => {
    const exists = availability.find((a) => a.day === day);
    if (exists) {
      setAvailability(availability.filter((a) => a.day !== day));
    } else {
      setAvailability([...availability, { day, startTime: "09:00", endTime: "18:00" }].sort((a, b) => a.day - b.day));
    }
  };

  const updateDayTime = (day: number, field: "startTime" | "endTime", value: string) => {
    setAvailability(availability.map((a) => a.day === day ? { ...a, [field]: value } : a));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await createStylist({
      salonId: salonId as any,
      name,
      phone: phone || undefined,
      availability,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} title="Add Stylist">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-label text-[#9c9184] block mb-1.5">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
        <div>
          <label className="font-label text-[#9c9184] block mb-1.5">Phone</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] text-foreground font-mono outline-none focus:ring-1 focus:ring-primary/30" placeholder="60123456789" />
        </div>
        <div>
          <label className="font-label text-[#9c9184] block mb-2">Availability</label>
          <div className="space-y-2">
            {DAY_NAMES.map((dayName, i) => {
              const slot = availability.find((a) => a.day === i);
              return (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`w-[80px] text-left text-[12px] font-medium px-2 py-1.5 rounded-md transition-colors ${
                      slot ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {dayName.slice(0, 3)}
                  </button>
                  {slot && (
                    <div className="flex items-center gap-1.5">
                      <input type="time" value={slot.startTime} onChange={(e) => updateDayTime(i, "startTime", e.target.value)} className="bg-background border border-border rounded-md px-2 py-1 text-[12px] font-data text-foreground outline-none focus:ring-1 focus:ring-primary/30" />
                      <span className="text-[11px] text-[#9c9184]">to</span>
                      <input type="time" value={slot.endTime} onChange={(e) => updateDayTime(i, "endTime", e.target.value)} className="bg-background border border-border rounded-md px-2 py-1 text-[12px] font-data text-foreground outline-none focus:ring-1 focus:ring-primary/30" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 h-9 text-[12px] font-medium rounded-lg border border-border text-muted-foreground hover:bg-[rgba(166,139,107,0.06)] transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving || !name} className="flex-1 h-9 text-[12px] font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? "Creating..." : "Add Stylist"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
