"use client";

import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDashboard } from "@/lib/dashboard-context";
import StatCard from "@/components/dashboard/StatCard";
import ServiceCard from "@/components/dashboard/services/ServiceCard";
import Modal from "@/components/dashboard/Modal";
import { Scissors, DollarSign, Clock, Plus } from "lucide-react";

export default function ServicesPage() {
  const { salonId, services } = useDashboard();
  const [showAdd, setShowAdd] = useState(false);

  const { activeServices, inactiveServices, avgPrice, avgDuration } = useMemo(() => {
    const active = services.filter((s) => s.isActive);
    const inactive = services.filter((s) => !s.isActive);
    const price = active.length > 0
      ? Math.round(active.reduce((sum, s) => sum + s.priceRM, 0) / active.length)
      : 0;
    const duration = active.length > 0
      ? Math.round(active.reduce((sum, s) => sum + s.durationMinutes, 0) / active.length)
      : 0;
    return { activeServices: active, inactiveServices: inactive, avgPrice: price, avgDuration: duration };
  }, [services]);

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="cadence-animate cadence-delay-1">
          <StatCard label="Active Services" value={String(activeServices.length)} icon={Scissors} iconColor="text-primary" />
        </div>
        <div className="cadence-animate cadence-delay-2">
          <StatCard label="Average Price" value={`RM ${avgPrice}`} icon={DollarSign} iconColor="text-[#5a9a6e]" />
        </div>
        <div className="cadence-animate cadence-delay-3">
          <StatCard label="Average Duration" value={`${avgDuration} min`} icon={Clock} iconColor="text-[#8a7055]" />
        </div>
      </div>

      {/* Active services */}
      <div className="cadence-animate cadence-delay-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-[15px] text-foreground">Active Services</h2>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Service
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeServices.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      </div>

      {/* Inactive services */}
      {inactiveServices.length > 0 && (
        <div className="cadence-animate cadence-delay-5">
          <h2 className="font-display text-[15px] text-[#9c9184] mb-3">Inactive Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {inactiveServices.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        </div>
      )}

      {showAdd && <AddServiceModal salonId={salonId} onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function AddServiceModal({ salonId, onClose }: { salonId: string; onClose: () => void }) {
  const createService = useMutation(api.services.mutations.create);
  const [name, setName] = useState("");
  const [nameBM, setNameBM] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("60");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await createService({
      salonId: salonId as any,
      name,
      nameBM: nameBM || undefined,
      description: description || undefined,
      durationMinutes: parseInt(duration, 10),
      priceRM: parseFloat(price),
    });
    setSaving(false);
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} title="Add Service">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-label text-[#9c9184] block mb-1.5">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-primary/30" />
        </div>
        <div>
          <label className="font-label text-[#9c9184] block mb-1.5">Name (BM)</label>
          <input type="text" value={nameBM} onChange={(e) => setNameBM(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-primary/30" placeholder="Optional" />
        </div>
        <div>
          <label className="font-label text-[#9c9184] block mb-1.5">Description</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-primary/30" placeholder="Optional" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-label text-[#9c9184] block mb-1.5">Duration (min)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} required min={15} step={15} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] text-foreground font-data outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
          <div>
            <label className="font-label text-[#9c9184] block mb-1.5">Price (RM)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min={0} step={1} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] text-foreground font-data outline-none focus:ring-1 focus:ring-primary/30" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 h-9 text-[12px] font-medium rounded-lg border border-border text-muted-foreground hover:bg-[rgba(166,139,107,0.06)] transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving || !name || !price} className="flex-1 h-9 text-[12px] font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? "Creating..." : "Add Service"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
