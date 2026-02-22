"use client";

import { useState } from "react";
import BookingStatusBadge from "@/components/dashboard/BookingStatusBadge";
import type { BookingStatus } from "@/components/dashboard/BookingStatusBadge";
import { enrichBookings } from "@/lib/dashboard-helpers";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import Modal from "@/components/dashboard/Modal";
import { User, Phone, Mail, Calendar, AlertTriangle, Pencil, Shield, ShieldOff } from "lucide-react";

interface CustomerProfileProps {
  customerId: Id<"customers"> | null;
  customers: Doc<"customers">[];
  services: Doc<"services">[];
  stylists: Doc<"stylists">[];
}

export default function CustomerProfile({ customerId, customers, services, stylists }: CustomerProfileProps) {
  const [editing, setEditing] = useState(false);
  const toggleBlacklist = useMutation(api.customers.mutations.toggleBlacklist);

  const rawBookings = useQuery(
    api.bookings.queries.getByCustomer,
    customerId ? { customerId } : "skip"
  );

  if (!customerId) {
    return (
      <div className="bg-card border border-border rounded-xl">
        <div className="py-12 text-center">
          <User className="w-10 h-10 text-[#9c9184] opacity-30 mx-auto mb-2" />
          <p className="text-[13px] text-muted-foreground">Select a customer to view details</p>
        </div>
      </div>
    );
  }

  const customer = customers.find((c) => c._id === customerId);
  if (!customer) return null;

  const bookings = rawBookings
    ? enrichBookings(rawBookings, customers, services, stylists).sort(
        (a, b) => b.date.localeCompare(a.date)
      )
    : [];

  const showRate =
    customer.totalBookings > 0
      ? Math.round(((customer.totalBookings - customer.noShowCount) / customer.totalBookings) * 100)
      : 0;

  return (
    <>
      <div className="bg-card border border-border rounded-xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display text-[17px] text-foreground">{customer.name}</span>
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 rounded-md hover:bg-[rgba(166,139,107,0.08)] transition-colors"
                title="Edit customer"
              >
                <Pencil className="w-3.5 h-3.5 text-[#9c9184]" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleBlacklist({ customerId: customer._id })}
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors ${
                  customer.isBlacklisted
                    ? "bg-[rgba(196,90,90,0.08)] text-[#c45a5a] hover:bg-[rgba(196,90,90,0.15)]"
                    : "bg-[rgba(90,154,110,0.08)] text-[#5a9a6e] hover:bg-[rgba(90,154,110,0.15)]"
                }`}
                title={customer.isBlacklisted ? "Remove from blacklist" : "Add to blacklist"}
              >
                {customer.isBlacklisted ? (
                  <><ShieldOff className="w-3 h-3" /> Blacklisted</>
                ) : (
                  <><Shield className="w-3 h-3" /> Active</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-5">
          {/* Contact info */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Phone className="w-3.5 h-3.5 text-[#9c9184]" />
              <span className="font-mono text-[13px]">+{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Mail className="w-3.5 h-3.5 text-[#9c9184]" />
                <span className="text-[13px]">{customer.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 text-[#9c9184]" />
              <span className="text-[13px]">
                Member since{" "}
                {new Date(customer._creationTime).toLocaleDateString("en-MY", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-lg bg-[rgba(166,139,107,0.05)] text-center">
              <p className="font-display font-data text-[18px] text-foreground">{customer.totalBookings}</p>
              <p className="text-[10px] text-[#9c9184] mt-0.5">Bookings</p>
            </div>
            <div className="p-2.5 rounded-lg bg-[rgba(166,139,107,0.05)] text-center">
              <p className={`font-display font-data text-[18px] ${customer.noShowCount > 0 ? "text-[#c45a5a]" : "text-foreground"}`}>
                {customer.noShowCount}
              </p>
              <p className="text-[10px] text-[#9c9184] mt-0.5">No-Shows</p>
            </div>
            <div className="p-2.5 rounded-lg bg-[rgba(166,139,107,0.05)] text-center">
              <p className="font-display font-data text-[18px] text-foreground">{showRate}%</p>
              <p className="text-[10px] text-[#9c9184] mt-0.5">Show Rate</p>
            </div>
          </div>

          {/* No-show warning */}
          {customer.noShowCount >= 2 && (
            <div className="flex items-start gap-2.5 p-3 bg-[rgba(196,152,62,0.08)] border border-[rgba(196,152,62,0.15)] rounded-lg">
              <AlertTriangle className="w-4 h-4 text-[#c4983e] mt-0.5 shrink-0" />
              <div>
                <p className="text-[13px] font-medium text-[#c4983e]">
                  {customer.noShowCount} no-shows recorded
                </p>
                {customer.notes && (
                  <p className="text-[12px] text-[#c4983e] opacity-80 mt-0.5">{customer.notes}</p>
                )}
              </div>
            </div>
          )}

          {/* Booking history */}
          <div>
            <p className="font-label text-[#9c9184] mb-3">Recent Bookings</p>
            <div className="space-y-2">
              {rawBookings === undefined ? (
                <p className="text-[13px] text-muted-foreground text-center py-4">Loading...</p>
              ) : bookings.length === 0 ? (
                <p className="text-[13px] text-muted-foreground text-center py-4">No bookings yet</p>
              ) : (
                bookings.slice(0, 6).map((b) => (
                  <div
                    key={b._id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[rgba(166,139,107,0.05)]"
                  >
                    <div>
                      <p className="text-[13px] font-medium text-foreground">{b.serviceName}</p>
                      <p className="text-[11px] text-[#9c9184] mt-0.5">
                        <span className="font-data">{b.date}</span> &middot; <span className="font-data">{b.startTime}</span> &middot; {b.stylistName}
                      </p>
                    </div>
                    <BookingStatusBadge status={b.status as BookingStatus} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <CustomerEditModal customer={customer} onClose={() => setEditing(false)} />
      )}
    </>
  );
}

function CustomerEditModal({ customer, onClose }: { customer: Doc<"customers">; onClose: () => void }) {
  const updateCustomer = useMutation(api.customers.mutations.update);
  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email ?? "");
  const [notes, setNotes] = useState(customer.notes ?? "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await updateCustomer({
      customerId: customer._id,
      name,
      email: email || undefined,
      notes: notes || undefined,
    });
    setSaving(false);
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} title="Edit Customer">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-label text-[#9c9184] block mb-1.5">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
        <div>
          <label className="font-label text-[#9c9184] block mb-1.5">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-primary/30" placeholder="Optional" />
        </div>
        <div>
          <label className="font-label text-[#9c9184] block mb-1.5">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-primary/30 resize-none" placeholder="Internal notes about this customer..." />
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
