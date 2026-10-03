import { trades, type TradeId } from "@/lib/trades";

/** Shared by the ticket form (client) and /api/book (server). No React, no Node APIs. */

export const WHEN_OPTIONS = [
  { id: "asap", label: "As soon as possible" },
  { id: "month", label: "Within a month" },
  { id: "1-3", label: "1–3 months" },
  { id: "planning", label: "Just planning" },
] as const;
export type WhenId = (typeof WHEN_OPTIONS)[number]["id"];

export const CONTACT_OPTIONS = [
  { id: "call", label: "Call" },
  { id: "text", label: "Text" },
  { id: "email", label: "Email" },
] as const;
export type ContactId = (typeof CONTACT_OPTIONS)[number]["id"];

export const LIMITS = {
  area: 120,
  name: 100,
  phone: 40,
  email: 254,
  notes: 2000,
  fileName: 200,
  maxFiles: 5,
  maxFileBytes: 8 * 1024 * 1024,
} as const;

export const PHONE_OR_EMAIL = "PHONE OR EMAIL NEEDED";

/** Name and size only. The files themselves are not uploaded by this form. */
export type PhotoMeta = { name: string; size: number };

export type BookingRequest = {
  services: TradeId[];
  area: string;
  when: WhenId;
  name: string;
  phone: string;
  email: string;
  contact: ContactId;
  notes: string;
  photos: PhotoMeta[];
};

export type BookingField =
  | "services"
  | "area"
  | "when"
  | "name"
  | "phone"
  | "email"
  | "contact"
  | "notes"
  | "photos";

export type BookingErrors = Partial<Record<BookingField, string>>;

export type BookingValidation =
  | { ok: true; data: BookingRequest }
  | { ok: false; errors: BookingErrors };

/** Top-to-bottom order of the ticket, used to find the first error. */
export const FIELD_ORDER: BookingField[] = [
  "services",
  "area",
  "when",
  "name",
  "phone",
  "email",
  "contact",
  "notes",
  "photos",
];

const tradeIds = new Set<string>(trades.map((t) => t.id));
const whenIds = new Set<string>(WHEN_OPTIONS.map((o) => o.id));
const contactIds = new Set<string>(CONTACT_OPTIONS.map((o) => o.id));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parsePhotos(value: unknown): PhotoMeta[] {
  if (!Array.isArray(value)) return [];
  const out: PhotoMeta[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) continue;
    const { name, size } = item as Record<string, unknown>;
    out.push({
      name: text(name, LIMITS.fileName) || "photo",
      size: typeof size === "number" && Number.isFinite(size) && size >= 0 ? size : 0,
    });
  }
  return out;
}

/** Trims, caps lengths and checks a booking request. Accepts untrusted input. */
export function validateBooking(input: unknown): BookingValidation {
  const raw = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const errors: BookingErrors = {};

  const services = Array.isArray(raw.services)
    ? [...new Set(raw.services.filter((s): s is TradeId => typeof s === "string" && tradeIds.has(s)))]
    : [];
  if (services.length === 0) errors.services = "PICK AT LEAST ONE SERVICE";

  const area = text(raw.area, LIMITS.area);
  if (!area) errors.area = "AREA NEEDED";

  const whenRaw = typeof raw.when === "string" ? raw.when : "";
  const when = whenIds.has(whenRaw) ? (whenRaw as WhenId) : null;
  if (!when) errors.when = "PICK A TIMEFRAME";

  const name = text(raw.name, LIMITS.name);
  if (!name) errors.name = "NAME NEEDED";

  const phone = text(raw.phone, LIMITS.phone);
  const email = text(raw.email, LIMITS.email);
  if (!phone && !email) {
    errors.phone = PHONE_OR_EMAIL;
  } else {
    if (phone && phone.replace(/\D/g, "").length < 10) errors.phone = "PHONE NEEDS 10 DIGITS";
    if (email && !EMAIL_RE.test(email)) errors.email = "EMAIL LOOKS OFF";
  }

  const contactRaw = typeof raw.contact === "string" ? raw.contact : "";
  const contact: ContactId = contactIds.has(contactRaw) ? (contactRaw as ContactId) : "text";

  const notes = text(raw.notes, LIMITS.notes);

  const photos = parsePhotos(raw.photos);
  if (photos.length > LIMITS.maxFiles) {
    errors.photos = `PHOTOS: ${LIMITS.maxFiles} FILES MAX`;
  } else if (photos.some((p) => p.size > LIMITS.maxFileBytes)) {
    errors.photos = "PHOTOS: 8MB EACH MAX";
  }

  if (Object.keys(errors).length > 0 || !when) return { ok: false, errors };
  return { ok: true, data: { services, area, when, name, phone, email, contact, notes, photos } };
}

export function whenLabel(id: WhenId): string {
  return WHEN_OPTIONS.find((o) => o.id === id)?.label ?? id;
}

/**
 * How we'll reach them. Honours the preferred method when the matching detail was given,
 * otherwise falls back to whichever detail exists (validation guarantees at least one).
 */
export function contactTarget(
  d: Pick<BookingRequest, "contact" | "phone" | "email">,
): { verb: "call" | "text" | "email"; value: string } {
  if (d.contact === "email" && d.email) return { verb: "email", value: d.email };
  if (d.contact !== "email" && d.phone) return { verb: d.contact, value: d.phone };
  if (d.phone) return { verb: "text", value: d.phone };
  return { verb: "email", value: d.email };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
