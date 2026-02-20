// Types for the onboarding form state

export interface OpeningHoursEntry {
  day: number;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface ServiceEntry {
  name: string;
  nameBM: string;
  durationMinutes: number;
  priceRM: number;
}

export interface StylistAvailability {
  day: number;
  startTime: string;
  endTime: string;
}

export interface StylistEntry {
  name: string;
  phone: string;
  availability: StylistAvailability[];
}

export interface OnboardingFormData {
  // Step 1: Salon details
  name: string;
  address: string;
  googleMapsLink: string;
  waPhoneNumberId: string;
  waBusinessAccountId: string;
  waAccessToken: string;
  adminPhones: string[];
  timezone: string;

  // Step 2: Opening hours
  openingHours: OpeningHoursEntry[];

  // Step 3: Services
  services: ServiceEntry[];

  // Step 4: Stylists
  stylists: StylistEntry[];
}

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const DEFAULT_OPENING_HOURS: OpeningHoursEntry[] = [
  { day: 0, open: "10:00", close: "20:00", isClosed: true },
  { day: 1, open: "10:00", close: "20:00", isClosed: false },
  { day: 2, open: "10:00", close: "20:00", isClosed: false },
  { day: 3, open: "10:00", close: "20:00", isClosed: false },
  { day: 4, open: "10:00", close: "20:00", isClosed: false },
  { day: 5, open: "10:00", close: "20:00", isClosed: false },
  { day: 6, open: "10:00", close: "20:00", isClosed: false },
];

export const INITIAL_FORM_DATA: OnboardingFormData = {
  name: "",
  address: "",
  googleMapsLink: "",
  waPhoneNumberId: "",
  waBusinessAccountId: "",
  waAccessToken: "",
  adminPhones: [""],
  timezone: "Asia/Kuala_Lumpur",
  openingHours: DEFAULT_OPENING_HOURS,
  services: [{ name: "", nameBM: "", durationMinutes: 30, priceRM: 0 }],
  stylists: [
    {
      name: "",
      phone: "",
      availability: [
        { day: 1, startTime: "10:00", endTime: "20:00" },
        { day: 2, startTime: "10:00", endTime: "20:00" },
        { day: 3, startTime: "10:00", endTime: "20:00" },
        { day: 4, startTime: "10:00", endTime: "20:00" },
        { day: 5, startTime: "10:00", endTime: "20:00" },
        { day: 6, startTime: "10:00", endTime: "20:00" },
      ],
    },
  ],
};
