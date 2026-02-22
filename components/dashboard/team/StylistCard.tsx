"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import Modal from "@/components/dashboard/Modal";
import { Pencil } from "lucide-react";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface StylistCardProps {
  stylist: Doc<"stylists">;
  stats?: { bookings: number; completed: number; noShows: number };
}

export default function StylistCard({ stylist, stats }: StylistCardProps) {
  const [editing, setEditing] = useState(false);
  const deactivate = useMutation(api.stylists.mutations.deactivate);
  const reactivate = useMutation(api.stylists.mutations.reactivate);

  const completionRate =
    stats && stats.bookings > 0
      ? Math.round((stats.completed / stats.bookings) * 100)
      : 0;

  return (
    <>
      <div className="bg-card border border-border rounded-xl card-glow transition-shadow group">
        <div className="px-5 py-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#a68b6b] to-[#8a7055] flex items-center justify-center text-[14px] font-semibold text-white shrink-0">
              {stylist.name.slice(0, 2).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[17px] text-foreground truncate">{stylist.name}</h3>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-[rgba(166,139,107,0.08)] transition-all"
                    title="Edit stylist"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#9c9184]" />
                  </button>
                  <span
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                      stylist.isActive
                        ? "bg-[rgba(90,154,110,0.08)] text-[#5a9a6e]"
                        : "bg-[rgba(42,36,32,0.05)] text-[#9c9184]"
                    }`}
                  >
                    {stylist.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              {stylist.phone && (
                <div className="flex items-center gap-1.5 mt-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9c9184]">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span className="text-[12px] text-[#9c9184] font-mono">+{stylist.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="p-2.5 rounded-lg bg-[rgba(166,139,107,0.05)] text-center">
              <div className="font-display font-data text-[14px] text-foreground">{stats?.bookings ?? 0}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Bookings</p>
            </div>
            <div className="p-2.5 rounded-lg bg-[rgba(166,139,107,0.05)] text-center">
              <div className="font-display font-data text-[14px] text-foreground">{completionRate}%</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Completed</p>
            </div>
            <div className="p-2.5 rounded-lg bg-[rgba(166,139,107,0.05)] text-center">
              <div className="font-display font-data text-[14px] text-foreground">{stylist.availability.length}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Days/wk</p>
            </div>
          </div>

          <button
            onClick={() =>
              stylist.isActive
                ? deactivate({ stylistId: stylist._id })
                : reactivate({ stylistId: stylist._id })
            }
            className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors ${
              stylist.isActive
                ? "text-[#c45a5a] hover:bg-[rgba(196,90,90,0.06)]"
                : "text-[#5a9a6e] hover:bg-[rgba(90,154,110,0.06)]"
            }`}
          >
            {stylist.isActive ? "Deactivate" : "Reactivate"}
          </button>
        </div>
      </div>

      {editing && (
        <StylistEditModal stylist={stylist} onClose={() => setEditing(false)} />
      )}
    </>
  );
}

function StylistEditModal({ stylist, onClose }: { stylist: Doc<"stylists">; onClose: () => void }) {
  const updateStylist = useMutation(api.stylists.mutations.update);
  const updateAvailability = useMutation(api.stylists.mutations.updateAvailability);

  const [name, setName] = useState(stylist.name);
  const [phone, setPhone] = useState(stylist.phone ?? "");
  const [availability, setAvailability] = useState(
    stylist.availability.map((a) => ({ ...a }))
  );
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
    await updateStylist({
      stylistId: stylist._id,
      name,
      phone: phone || undefined,
    });
    await updateAvailability({
      stylistId: stylist._id,
      availability,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} title="Edit Stylist">
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
          <button type="submit" disabled={saving} className="flex-1 h-9 text-[12px] font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
