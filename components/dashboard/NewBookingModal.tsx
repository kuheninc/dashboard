"use client";

import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDashboard } from "@/lib/dashboard-context";
import Modal from "./Modal";
import type { Id, Doc } from "@/convex/_generated/dataModel";

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function generateTimeSlots(open: string, close: string, intervalMinutes = 30): string[] {
  const slots: string[] = [];
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  let current = oh * 60 + om;
  const end = ch * 60 + cm;
  while (current < end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    current += intervalMinutes;
  }
  return slots;
}

export default function NewBookingModal({ isOpen, onClose }: NewBookingModalProps) {
  const { salonId, salon, services, stylists, customers } = useDashboard();
  const createBooking = useMutation(api.bookings.mutations.create);
  const createCustomer = useMutation(api.customers.mutations.create);

  const [customerId, setCustomerId] = useState<Id<"customers"> | "">("");
  const [serviceId, setServiceId] = useState<Id<"services"> | "">("");
  const [stylistId, setStylistId] = useState<Id<"stylists"> | "">("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // New customer fields
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  // Customer search
  const [customerSearch, setCustomerSearch] = useState("");

  const activeServices = useMemo(
    () => services.filter((s) => s.isActive),
    [services]
  );
  const activeStylists = useMemo(
    () => stylists.filter((s) => s.isActive),
    [stylists]
  );

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers.slice(0, 20);
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.phone.includes(q)
    ).slice(0, 20);
  }, [customers, customerSearch]);

  // Get time slots for the selected date
  const timeSlots = useMemo(() => {
    if (!date) return [];
    const d = new Date(date + "T00:00:00");
    const dayOfWeek = d.getDay();
    const hours = salon.openingHours.find((h) => h.day === dayOfWeek);
    if (!hours || hours.isClosed) return [];
    return generateTimeSlots(hours.open, hours.close);
  }, [date, salon.openingHours]);

  const todayStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
  });

  const resetForm = () => {
    setCustomerId("");
    setServiceId("");
    setStylistId("");
    setDate("");
    setStartTime("");
    setError("");
    setShowNewCustomer(false);
    setNewName("");
    setNewPhone("");
    setCustomerSearch("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setError("");

    let finalCustomerId = customerId as Id<"customers">;

    // Create new customer if needed
    if (showNewCustomer) {
      if (!newName.trim() || !newPhone.trim()) {
        setError("Customer name and phone are required");
        return;
      }
      try {
        finalCustomerId = await createCustomer({
          salonId,
          name: newName.trim(),
          phone: newPhone.trim(),
        });
      } catch {
        setError("Failed to create customer");
        return;
      }
    }

    if (!finalCustomerId || !serviceId || !stylistId || !date || !startTime) {
      setError("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      await createBooking({
        salonId,
        customerId: finalCustomerId,
        serviceId: serviceId as Id<"services">,
        stylistId: stylistId as Id<"stylists">,
        date,
        startTime,
        createdBy: "admin",
      });
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-primary/30 transition-colors";
  const labelClass = "font-label text-[12px] text-[#9c9184] block mb-1.5";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Booking">
      <div className="space-y-4">
        {/* Customer */}
        <div>
          <label className={labelClass}>Customer</label>
          {!showNewCustomer ? (
            <>
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className={`${inputClass} mb-2`}
              />
              <div className="max-h-[120px] overflow-y-auto border border-border rounded-lg">
                {filteredCustomers.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => {
                      setCustomerId(c._id);
                      setCustomerSearch(c.name);
                    }}
                    className={`w-full text-left px-3 py-2 text-[13px] hover:bg-[rgba(166,139,107,0.06)] transition-colors border-b border-border last:border-b-0 ${
                      customerId === c._id
                        ? "bg-[rgba(166,139,107,0.08)] text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span className="text-foreground">{c.name}</span>
                    <span className="ml-2 text-[11px] text-[#9c9184] font-data">{c.phone}</span>
                  </button>
                ))}
                {filteredCustomers.length === 0 && (
                  <p className="px-3 py-2 text-[12px] text-[#9c9184]">No customers found</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowNewCustomer(true);
                  setCustomerId("");
                  setCustomerSearch("");
                }}
                className="mt-2 text-[12px] text-primary hover:underline"
              >
                + Add new customer
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Customer name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Phone (+60...)"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => {
                  setShowNewCustomer(false);
                  setNewName("");
                  setNewPhone("");
                }}
                className="text-[12px] text-[#9c9184] hover:underline"
              >
                Select existing customer instead
              </button>
            </div>
          )}
        </div>

        {/* Service */}
        <div>
          <label className={labelClass}>Service</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value as Id<"services"> | "")}
            className={inputClass}
          >
            <option value="">Select a service</option>
            {activeServices.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} — RM{s.priceRM} ({s.durationMinutes}min)
              </option>
            ))}
          </select>
        </div>

        {/* Stylist */}
        <div>
          <label className={labelClass}>Stylist</label>
          <select
            value={stylistId}
            onChange={(e) => setStylistId(e.target.value as Id<"stylists"> | "")}
            className={inputClass}
          >
            <option value="">Select a stylist</option>
            {activeStylists.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            value={date}
            min={todayStr}
            onChange={(e) => {
              setDate(e.target.value);
              setStartTime("");
            }}
            className={inputClass}
          />
          {date && timeSlots.length === 0 && (
            <p className="mt-1 text-[11px] text-[#c45a5a]">
              Salon is closed on this day
            </p>
          )}
        </div>

        {/* Time */}
        {timeSlots.length > 0 && (
          <div>
            <label className={labelClass}>Time</label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a time</option>
              {timeSlots.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-[12px] text-[#c45a5a]">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 h-9 text-[13px] font-medium rounded-lg border border-border text-muted-foreground hover:bg-[rgba(166,139,107,0.06)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 h-9 text-[13px] font-medium rounded-lg text-primary-foreground bg-primary hover:bg-[#8a7055] transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Booking"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
