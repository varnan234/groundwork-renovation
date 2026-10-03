import { NextResponse } from "next/server";
import { site } from "@/lib/site";
import { tradeById } from "@/lib/trades";
import {
  contactTarget,
  formatBytes,
  validateBooking,
  whenLabel,
  type BookingRequest,
} from "@/lib/booking";

const MAX_BODY_BYTES = 50_000;
const REF_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function makeRef(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  return "GW-" + Array.from(bytes, (b) => REF_ALPHABET[b % 36]).join("");
}

function summarize(ref: string, d: BookingRequest): string {
  const how = contactTarget(d);
  const lines = [
    `Ticket ${ref}`,
    `Services: ${d.services.map((id) => tradeById[id].name).join(", ")}`,
    `Area: ${d.area}`,
    `When: ${whenLabel(d.when)}`,
    `Name: ${d.name}`,
    `Phone: ${d.phone || "(none)"}`,
    `Email: ${d.email || "(none)"}`,
    `Preferred contact: ${how.verb} at ${how.value}`,
    `Notes: ${d.notes || "(none)"}`,
  ];
  // Attachments are not forwarded yet: only file names and sizes arrive, so list them for follow-up.
  if (d.photos.length > 0) {
    lines.push(`Photos chosen (names only, not uploaded): ${d.photos.map((p) => `${p.name} (${formatBytes(p.size)})`).join(", ")}`);
  }
  return lines.join("\n");
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Request too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  // Honeypot: real visitors never see this field. Answer with a fake success so bots learn nothing.
  const honeypot = (body as { website?: unknown } | null)?.website;
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return NextResponse.json({ ok: true, ref: makeRef() });
  }

  const result = validateBooking(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, errors: result.errors }, { status: 400 });
  }

  const ref = makeRef();
  const { data } = result;
  const forwardUrl = process.env.BOOKING_FORWARD_URL;

  if (!forwardUrl) {
    // Dev / placeholder behaviour: no endpoint is configured yet, so log the request and report success.
    // Set BOOKING_FORWARD_URL (see .env.example) to deliver requests by email.
    console.info(`[booking] ${ref}\n${summarize(ref, data)}`);
    return NextResponse.json({ ok: true, ref });
  }

  try {
    const res = await fetch(forwardUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        // Formspree-compatible: `_subject` sets the email subject, `email` becomes the reply-to.
        _subject: `${site.shortName} request ${ref}: ${data.services.map((id) => tradeById[id].name).join(", ")}`,
        ...(data.email ? { email: data.email } : {}),
        message: summarize(ref, data),
        ref,
        name: data.name,
        phone: data.phone,
        area: data.area,
        when: whenLabel(data.when),
        services: data.services.map((id) => tradeById[id].name).join(", "),
        preferred_contact: data.contact,
        notes: data.notes,
        photo_files: data.photos.map((p) => `${p.name} (${formatBytes(p.size)})`).join(", "),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Forward endpoint responded ${res.status}`);
  } catch (error) {
    console.error(`[booking] ${ref} forward failed`, error);
    return NextResponse.json({ ok: false, error: "Could not deliver the request." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, ref });
}

export function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } });
}
