"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import Modal from "@/components/dashboard/Modal";
import { Pencil } from "lucide-react";

export default function ServiceCard({ service }: { service: Doc<"services"> }) {
  const [editing, setEditing] = useState(false);
  const updateService = useMutation(api.services.mutations.update);
  const deactivate = useMutation(api.services.mutations.deactivate);
  const reactivate = useMutation(api.services.mutations.reactivate);

  return (
    <>
      <div className="bg-card border border-border rounded-xl card-glow transition-shadow group relative">
        <div className="px-5 py-4">
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0">
              <h3 className="font-display text-[17px] text-foreground">{service.name}</h3>
              {service.nameBM && (
                <p className="text-[13px] text-muted-foreground mt-0.5">{service.nameBM}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-3">
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-[rgba(166,139,107,0.08)] transition-all"
                title="Edit service"
              >
                <Pencil className="w-3.5 h-3.5 text-[#9c9184]" />
              </button>
              <span
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                  service.isActive
                    ? "bg-[rgba(90,154,110,0.08)] text-[#5a9a6e]"
                    : "bg-[rgba(42,36,32,0.05)] text-[#9c9184]"
                }`}
              >
                {service.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] text-muted-foreground">RM</span>
              <span className="font-display font-data text-[14px] text-foreground">{service.priceRM}</span>
            </div>
            <div className="w-px h-3 bg-border" />
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#9c9184]">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-[13px] text-muted-foreground font-data">{service.durationMinutes} min</span>
            </div>
          </div>

          <button
            onClick={() =>
              service.isActive
                ? deactivate({ serviceId: service._id })
                : reactivate({ serviceId: service._id })
            }
            className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors ${
              service.isActive
                ? "text-[#c45a5a] hover:bg-[rgba(196,90,90,0.06)]"
                : "text-[#5a9a6e] hover:bg-[rgba(90,154,110,0.06)]"
            }`}
          >
            {service.isActive ? "Deactivate" : "Reactivate"}
          </button>
        </div>
      </div>

      {editing && (
        <ServiceEditModal
          service={service}
          onClose={() => setEditing(false)}
          onSave={updateService}
        />
      )}
    </>
  );
}

function ServiceEditModal({
  service,
  onClose,
  onSave,
}: {
  service: Doc<"services">;
  onClose: () => void;
  onSave: (args: { serviceId: Doc<"services">["_id"]; name?: string; nameBM?: string; description?: string; durationMinutes?: number; priceRM?: number }) => Promise<unknown>;
}) {
  const [name, setName] = useState(service.name);
  const [nameBM, setNameBM] = useState(service.nameBM ?? "");
  const [description, setDescription] = useState(service.description ?? "");
  const [duration, setDuration] = useState(String(service.durationMinutes));
  const [price, setPrice] = useState(String(service.priceRM));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      serviceId: service._id,
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
    <Modal isOpen onClose={onClose} title="Edit Service">
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
          <button type="submit" disabled={saving} className="flex-1 h-9 text-[12px] font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
