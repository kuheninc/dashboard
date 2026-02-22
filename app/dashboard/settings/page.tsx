"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useDashboard } from "@/lib/dashboard-context";
import { ChevronDown, ChevronUp, Save } from "lucide-react";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function Section({
  title,
  description,
  children,
  defaultOpen = false,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card border border-border rounded-xl">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <h3 className="font-display text-[15px] text-foreground">{title}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-[#9c9184] shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#9c9184] shrink-0" />
        )}
      </button>
      {open && <div className="px-5 pb-5 border-t border-border pt-4">{children}</div>}
    </div>
  );
}

function SaveButton({ dirty, saving, onClick }: { dirty: boolean; saving: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!dirty || saving}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
    >
      <Save className="w-3.5 h-3.5" />
      {saving ? "Saving..." : "Save"}
    </button>
  );
}

function SalonInfoSection() {
  const { salon } = useDashboard();
  const updateInfo = useMutation(api.salons.mutations.updateInfo);
  const [name, setName] = useState(salon.name);
  const [address, setAddress] = useState(salon.address);
  const [mapsLink, setMapsLink] = useState(salon.googleMapsLink ?? "");
  const [saving, setSaving] = useState(false);

  const dirty = name !== salon.name || address !== salon.address || mapsLink !== (salon.googleMapsLink ?? "");

  const handleSave = async () => {
    setSaving(true);
    await updateInfo({
      salonId: salon._id,
      name,
      address,
      googleMapsLink: mapsLink || undefined,
    });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="font-label text-[#9c9184] block mb-1.5">Salon Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-primary/30 max-w-md" />
      </div>
      <div>
        <label className="font-label text-[#9c9184] block mb-1.5">Address</label>
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-primary/30 max-w-md" />
      </div>
      <div>
        <label className="font-label text-[#9c9184] block mb-1.5">Google Maps Link</label>
        <input type="url" value={mapsLink} onChange={(e) => setMapsLink(e.target.value)} placeholder="https://maps.google.com/..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-primary/30 max-w-md placeholder:text-[#9c9184]" />
      </div>
      <SaveButton dirty={dirty} saving={saving} onClick={handleSave} />
    </div>
  );
}

function OpeningHoursSection() {
  const { salon } = useDashboard();
  const updateHours = useMutation(api.salons.mutations.updateHours);
  const [hours, setHours] = useState(salon.openingHours.map((h) => ({ ...h })));
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(hours) !== JSON.stringify(salon.openingHours);

  const updateDay = (day: number, field: string, value: string | boolean) => {
    setHours(hours.map((h) => (h.day === day ? { ...h, [field]: value } : h)));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateHours({ salonId: salon._id, openingHours: hours });
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      {DAY_NAMES.map((dayName, i) => {
        const slot = hours.find((h) => h.day === i);
        if (!slot) return null;
        return (
          <div key={i} className="flex items-center gap-3 flex-wrap">
            <span className="w-[80px] text-[12px] font-medium text-foreground">{dayName}</span>
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={slot.isClosed}
                onChange={(e) => updateDay(i, "isClosed", e.target.checked)}
                className="accent-primary"
              />
              <span className="text-[11px] text-muted-foreground">Closed</span>
            </label>
            {!slot.isClosed && (
              <div className="flex items-center gap-1.5">
                <input type="time" value={slot.open} onChange={(e) => updateDay(i, "open", e.target.value)} className="bg-background border border-border rounded-md px-2 py-1 text-[12px] font-data text-foreground outline-none focus:ring-1 focus:ring-primary/30" />
                <span className="text-[11px] text-[#9c9184]">to</span>
                <input type="time" value={slot.close} onChange={(e) => updateDay(i, "close", e.target.value)} className="bg-background border border-border rounded-md px-2 py-1 text-[12px] font-data text-foreground outline-none focus:ring-1 focus:ring-primary/30" />
              </div>
            )}
          </div>
        );
      })}
      <SaveButton dirty={dirty} saving={saving} onClick={handleSave} />
    </div>
  );
}

function ClosedDatesSection() {
  const { salon } = useDashboard();
  const updateClosedDates = useMutation(api.salons.mutations.updateClosedDates);
  const [dates, setDates] = useState([...salon.closedDates]);
  const [newDate, setNewDate] = useState("");
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(dates) !== JSON.stringify(salon.closedDates);

  const addDate = () => {
    if (newDate && !dates.includes(newDate)) {
      setDates([...dates, newDate].sort());
      setNewDate("");
    }
  };

  const removeDate = (d: string) => setDates(dates.filter((x) => x !== d));

  const handleSave = async () => {
    setSaving(true);
    await updateClosedDates({ salonId: salon._id, closedDates: dates });
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 max-w-sm">
        <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2 text-[13px] font-data text-foreground outline-none focus:ring-1 focus:ring-primary/30 flex-1" />
        <button onClick={addDate} disabled={!newDate} className="px-3 py-2 text-[12px] font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity">
          Add
        </button>
      </div>
      {dates.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {dates.map((d) => (
            <span key={d} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-md text-[12px] font-data text-foreground">
              {d}
              <button onClick={() => removeDate(d)} className="text-[#c45a5a] hover:text-[#a04545]">&times;</button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-[12px] text-muted-foreground">No closed dates set</p>
      )}
      <SaveButton dirty={dirty} saving={saving} onClick={handleSave} />
    </div>
  );
}

function AdminPhonesSection() {
  const { salon } = useDashboard();
  const updateAdminPhones = useMutation(api.salons.mutations.updateAdminPhones);
  const [phones, setPhones] = useState([...salon.adminPhones]);
  const [newPhone, setNewPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(phones) !== JSON.stringify(salon.adminPhones);

  const addPhone = () => {
    if (newPhone && !phones.includes(newPhone)) {
      setPhones([...phones, newPhone]);
      setNewPhone("");
    }
  };

  const removePhone = (p: string) => {
    if (phones.length <= 1) return;
    setPhones(phones.filter((x) => x !== p));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateAdminPhones({ salonId: salon._id, adminPhones: phones });
    setSaving(false);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {phones.map((p, i) => (
          <div key={i} className="flex items-center gap-2 max-w-sm">
            <span className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-foreground">+{p}</span>
            {phones.length > 1 && (
              <button onClick={() => removePhone(p)} className="text-[12px] text-[#c45a5a] hover:text-[#a04545] font-medium">Remove</button>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 max-w-sm">
        <input type="text" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="60123456789" className="bg-background border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-foreground outline-none focus:ring-1 focus:ring-primary/30 flex-1 placeholder:text-[#9c9184]" />
        <button onClick={addPhone} disabled={!newPhone} className="px-3 py-2 text-[12px] font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity">
          Add
        </button>
      </div>
      <SaveButton dirty={dirty} saving={saving} onClick={handleSave} />
    </div>
  );
}

function WhatsAppSection() {
  const { salon } = useDashboard();
  const updateWaToken = useMutation(api.salons.mutations.updateWaToken);
  const [token, setToken] = useState(salon.waAccessToken);
  const [saving, setSaving] = useState(false);

  const dirty = token !== salon.waAccessToken;

  const handleSave = async () => {
    setSaving(true);
    await updateWaToken({ salonId: salon._id, waAccessToken: token });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="font-label text-[#9c9184] block mb-1.5">Phone Number ID</label>
        <div className="bg-muted border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-muted-foreground max-w-md">
          {salon.waPhoneNumberId}
        </div>
      </div>
      <div>
        <label className="font-label text-[#9c9184] block mb-1.5">Business Account ID</label>
        <div className="bg-muted border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-muted-foreground max-w-md">
          {salon.waBusinessAccountId}
        </div>
      </div>
      <div>
        <label className="font-label text-[#9c9184] block mb-1.5">Access Token</label>
        <input type="password" value={token} onChange={(e) => setToken(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] font-mono text-foreground outline-none focus:ring-1 focus:ring-primary/30 max-w-md" />
      </div>
      <SaveButton dirty={dirty} saving={saving} onClick={handleSave} />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-4 max-w-[800px]">
      <Section title="Salon Information" description="Name, address, and map link" defaultOpen>
        <SalonInfoSection />
      </Section>
      <Section title="Opening Hours" description="Weekly schedule for your salon">
        <OpeningHoursSection />
      </Section>
      <Section title="Closed Dates" description="Holidays and special closures">
        <ClosedDatesSection />
      </Section>
      <Section title="Admin Phones" description="Phone numbers with admin access">
        <AdminPhonesSection />
      </Section>
      <Section title="WhatsApp Integration" description="WhatsApp Cloud API credentials">
        <WhatsAppSection />
      </Section>
    </div>
  );
}
