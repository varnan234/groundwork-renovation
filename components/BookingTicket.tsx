"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { Check, Upload, X } from "lucide-react";
import { useRack } from "@/components/RackProvider";
import { site } from "@/lib/site";
import { tradeById, trades } from "@/lib/trades";
import {
  CONTACT_OPTIONS,
  FIELD_ORDER,
  LIMITS,
  PHONE_OR_EMAIL,
  WHEN_OPTIONS,
  contactTarget,
  formatBytes,
  validateBooking,
  whenLabel,
  type BookingErrors,
  type BookingField,
  type BookingRequest,
  type ContactId,
  type WhenId,
} from "@/lib/booking";
import styles from "./BookingTicket.module.css";

type Fields = {
  area: string;
  when: WhenId | "";
  name: string;
  phone: string;
  email: string;
  contact: ContactId;
  notes: string;
  /** Honeypot. Humans never see it. */
  website: string;
};

type Status = "idle" | "sending" | "success" | "error";
type Receipt = { ref: string; data: BookingRequest; hadPhotos: boolean };

const EMPTY: Fields = { area: "", when: "", name: "", phone: "", email: "", contact: "text", notes: "", website: "" };

const fileKey = (f: File) => `${f.name}:${f.size}:${f.lastModified}`;

function PrintError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className={styles.err}>
      {message}
    </p>
  );
}

export function BookingTicket() {
  const { pulled, isPulled, toggle, clear } = useRack();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [photoNote, setPhotoNote] = useState("");
  const [dragging, setDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [today, setToday] = useState("");
  const [announce, setAnnounce] = useState("");
  const receiptRef = useRef<HTMLDivElement>(null);

  // The date is set after mount so server and client markup match regardless of timezone.
  useEffect(() => {
    setToday(new Intl.DateTimeFormat("en-CA").format(new Date()));
  }, []);

  useEffect(() => {
    if (status === "success") receiptRef.current?.focus();
  }, [status]);

  const input = {
    services: pulled,
    area: fields.area,
    when: fields.when,
    name: fields.name,
    phone: fields.phone,
    email: fields.email,
    contact: fields.contact,
    notes: fields.notes,
    // Names and sizes only. The API does not forward the files themselves yet.
    photos: files.map((f) => ({ name: f.name, size: f.size })),
  };
  const result = validateBooking(input);
  // Errors print on submit, then update live as the visitor fixes each field.
  const shown: BookingErrors = submitted && !result.ok ? result.errors : {};
  const describedBy = (f: BookingField) => (shown[f] ? `bk-${f}-err` : undefined);
  const phoneOrEmailMissing = shown.phone === PHONE_OR_EMAIL;

  const set = <K extends keyof Fields>(key: K, value: Fields[K]) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  function focusField(field: BookingField) {
    const el = document.getElementById(`bk-${field}`);
    const target = el?.matches("input, textarea, button") ? el : el?.querySelector<HTMLElement>("button, input, textarea");
    target?.focus();
  }

  function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list);
    const seen = new Set(files.map(fileKey));
    const next = [...files];
    let skipped = 0;
    for (const f of incoming) {
      if (!f.type.startsWith("image/") || f.size > LIMITS.maxFileBytes) {
        skipped++;
        continue;
      }
      if (seen.has(fileKey(f))) continue;
      if (next.length >= LIMITS.maxFiles) {
        skipped++;
        continue;
      }
      seen.add(fileKey(f));
      next.push(f);
    }
    setFiles(next);
    setPhotoNote(skipped ? `SKIPPED ${skipped}: IMAGES ONLY, 8MB EACH, ${LIMITS.maxFiles} MAX` : "");
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = ""; // lets the same file be chosen again after removing it
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function removeFile(key: string) {
    setFiles((prev) => prev.filter((f) => fileKey(f) !== key));
    setPhotoNote("");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setSubmitted(true);

    if (!result.ok) {
      const first = FIELD_ORDER.find((f) => result.errors[f]);
      const count = Object.keys(result.errors).length;
      setAnnounce(`${count} ${count === 1 ? "line needs" : "lines need"} fixing.`);
      if (first) focusField(first);
      return;
    }

    setStatus("sending");
    setAnnounce("Printing your ticket.");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.data, website: fields.website }),
        signal: AbortSignal.timeout(15000),
      });
      const body: { ok?: boolean; ref?: string } = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok || !body.ref) throw new Error(`Booking failed (${res.status})`);
      setReceipt({ ref: body.ref, data: result.data, hadPhotos: result.data.photos.length > 0 });
      setStatus("success");
      setAnnounce(`Request sent. Ticket number ${body.ref}.`);
    } catch {
      setStatus("error");
      setAnnounce(`Couldn't send. Try again, or call ${site.phoneDisplay}.`);
    }
  }

  function startNew() {
    setFields(EMPTY);
    setFiles([]);
    setPhotoNote("");
    setSubmitted(false);
    setReceipt(null);
    setStatus("idle");
    setAnnounce("New ticket ready.");
    clear();
    requestAnimationFrame(() => focusField("services"));
  }

  const sending = status === "sending";
  const how = receipt ? contactTarget(receipt.data) : null;

  return (
    <section id="book" data-ground="dark" aria-labelledby="book-title" className={styles.section}>
      <div className={styles.head}>
        <h2 id="book-title" className={styles.title}>
          Book a service
        </h2>
        <p className={styles.lead}>Fill in the ticket. We&apos;ll call or text to set up a visit.</p>
      </div>

      <div className={styles.wrap}>
        <div className={styles.ticket} aria-busy={sending}>
          <header className={styles.ticketHead}>
            <p className={styles.kind}>Request ticket</p>
            <p className={styles.shop}>{site.name}</p>
            <p className={styles.dateLine}>
              <span>Date</span>
              <span className={styles.leader} aria-hidden="true" />
              <span className={styles.date}>{today}</span>
            </p>
            <hr className={styles.rule} />
          </header>

          {status === "success" && receipt && how ? (
            <div ref={receiptRef} tabIndex={-1} role="group" className={styles.receipt} aria-labelledby="bk-receipt-title">
              <p id="bk-receipt-title" className={`${styles.printLine} ${styles.refLine}`} style={{ "--i": 0 } as React.CSSProperties}>
                <span className={styles.refLabel}>Ticket #</span>
                <span className={styles.refCode}>{receipt.ref}</span>
              </p>
              <dl className={styles.facts}>
                <div className={styles.printLine} style={{ "--i": 1 } as React.CSSProperties}>
                  <dt>Services</dt>
                  <dd>{receipt.data.services.map((id) => tradeById[id].name).join(", ")}</dd>
                </div>
                <div className={styles.printLine} style={{ "--i": 2 } as React.CSSProperties}>
                  <dt>Area</dt>
                  <dd>{receipt.data.area}</dd>
                </div>
                <div className={styles.printLine} style={{ "--i": 3 } as React.CSSProperties}>
                  <dt>When</dt>
                  <dd>{whenLabel(receipt.data.when)}</dd>
                </div>
              </dl>
              <hr className={styles.rule} />
              <p className={`${styles.printLine} ${styles.how}`} style={{ "--i": 4 } as React.CSSProperties}>
                We&apos;ll {how.verb} you at {how.value}.
              </p>
              <p className={`${styles.printLine} ${styles.dm}`} style={{ "--i": 5 } as React.CSSProperties}>
                {receipt.hadPhotos ? "Photos don't upload through this form yet. " : ""}
                Got photos? DM them to{" "}
                <a href={site.instagramDmUrl} target="_blank" rel="noopener noreferrer">
                  {site.instagramHandle}
                </a>
              </p>
              <button type="button" className={styles.again} onClick={startNew}>
                Start a new ticket
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={onSubmit} noValidate aria-label="Request ticket">
              <p className={styles.legendNote}>Every line is required unless marked optional.</p>

              {/* SERVICES */}
              <fieldset id="bk-services" className={styles.group} aria-describedby={describedBy("services")}>
                <legend className={styles.line}>
                  <span className={styles.label}>Services</span>
                  <span className={styles.leader} aria-hidden="true" />
                  <span className={styles.hint}>Pick 1 or more</span>
                </legend>
                <div className={styles.chips}>
                  {trades.map((t) => {
                    const on = isPulled(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={styles.chip}
                        aria-pressed={on}
                        onClick={() => toggle(t.id)}
                      >
                        <span className={styles.swatch} style={{ background: t.ramp[3] }} aria-hidden="true" />
                        <span>{t.name}</span>
                        <Check className={styles.tick} size={14} strokeWidth={3} aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
                <PrintError id="bk-services-err" message={shown.services} />
              </fieldset>

              {/* AREA */}
              <div className={styles.row}>
                <label htmlFor="bk-area" className={styles.label}>
                  Area
                </label>
                <span className={styles.leader} aria-hidden="true" />
                <div className={styles.field}>
                  <input
                    id="bk-area"
                    className={styles.input}
                    type="text"
                    name="area"
                    autoComplete="address-level2"
                    maxLength={LIMITS.area}
                    placeholder="Mississauga, Port Credit"
                    value={fields.area}
                    onChange={(e) => set("area", e.target.value)}
                    aria-required="true"
                    aria-invalid={shown.area ? true : undefined}
                    aria-describedby={describedBy("area")}
                  />
                </div>
                <PrintError id="bk-area-err" message={shown.area} />
              </div>

              {/* WHEN */}
              <fieldset
                id="bk-when"
                className={styles.group}
                role="radiogroup"
                aria-required="true"
                aria-invalid={shown.when ? true : undefined}
                aria-describedby={describedBy("when")}
              >
                <legend className={styles.line}>
                  <span className={styles.label}>When</span>
                  <span className={styles.leader} aria-hidden="true" />
                </legend>
                <div className={`${styles.segments} ${styles.segments4}`}>
                  {WHEN_OPTIONS.map((o) => (
                    <label key={o.id} className={styles.segment}>
                      <input
                        type="radio"
                        name="when"
                        value={o.id}
                        checked={fields.when === o.id}
                        onChange={() => set("when", o.id)}
                      />
                      <span>{o.label}</span>
                    </label>
                  ))}
                </div>
                <PrintError id="bk-when-err" message={shown.when} />
              </fieldset>

              {/* NAME */}
              <div className={styles.row}>
                <label htmlFor="bk-name" className={styles.label}>
                  Name
                </label>
                <span className={styles.leader} aria-hidden="true" />
                <div className={styles.field}>
                  <input
                    id="bk-name"
                    className={styles.input}
                    type="text"
                    name="name"
                    autoComplete="name"
                    maxLength={LIMITS.name}
                    value={fields.name}
                    onChange={(e) => set("name", e.target.value)}
                    aria-required="true"
                    aria-invalid={shown.name ? true : undefined}
                    aria-describedby={describedBy("name")}
                  />
                </div>
                <PrintError id="bk-name-err" message={shown.name} />
              </div>

              {/* PHONE */}
              <div className={styles.row}>
                <label htmlFor="bk-phone" className={styles.label}>
                  Phone
                </label>
                <span className={styles.leader} aria-hidden="true" />
                <div className={styles.field}>
                  <input
                    id="bk-phone"
                    className={styles.input}
                    type="tel"
                    name="phone"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={LIMITS.phone}
                    value={fields.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    aria-required={fields.email.trim() ? undefined : "true"}
                    aria-invalid={shown.phone ? true : undefined}
                    aria-describedby={describedBy("phone")}
                  />
                </div>
                <PrintError id="bk-phone-err" message={shown.phone} />
              </div>

              {/* EMAIL */}
              <div className={styles.row}>
                <label htmlFor="bk-email" className={styles.label}>
                  Email
                </label>
                <span className={styles.leader} aria-hidden="true" />
                <div className={styles.field}>
                  <input
                    id="bk-email"
                    className={styles.input}
                    type="email"
                    name="email"
                    autoComplete="email"
                    maxLength={LIMITS.email}
                    placeholder="you@example.com"
                    value={fields.email}
                    onChange={(e) => set("email", e.target.value)}
                    aria-required={fields.phone.trim() ? undefined : "true"}
                    aria-invalid={shown.email || phoneOrEmailMissing ? true : undefined}
                    aria-describedby={shown.email ? "bk-email-err" : phoneOrEmailMissing ? "bk-phone-err" : undefined}
                  />
                </div>
                <PrintError id="bk-email-err" message={shown.email} />
              </div>

              {/* PREFERRED CONTACT */}
              <fieldset id="bk-contact" className={styles.group}>
                <legend className={styles.line}>
                  <span className={styles.label}>Preferred contact</span>
                  <span className={styles.leader} aria-hidden="true" />
                </legend>
                <div className={`${styles.segments} ${styles.segments3}`}>
                  {CONTACT_OPTIONS.map((o) => (
                    <label key={o.id} className={styles.segment}>
                      <input
                        type="radio"
                        name="contact"
                        value={o.id}
                        checked={fields.contact === o.id}
                        onChange={() => set("contact", o.id)}
                      />
                      <span>{o.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* NOTES */}
              <div className={styles.group}>
                <div className={styles.line}>
                  <label htmlFor="bk-notes" className={styles.label}>
                    Notes
                  </label>
                  <span className={styles.leader} aria-hidden="true" />
                  <span className={styles.hint}>Optional</span>
                </div>
                <textarea
                  id="bk-notes"
                  className={`${styles.input} ${styles.textarea}`}
                  name="notes"
                  rows={4}
                  maxLength={LIMITS.notes}
                  placeholder="Room size, what's there now, anything we should know."
                  value={fields.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  aria-describedby={describedBy("notes")}
                />
                <PrintError id="bk-notes-err" message={shown.notes} />
              </div>

              {/* PHOTOS */}
              <div id="bk-photos-group" className={styles.group}>
                <div className={styles.line}>
                  <span className={styles.label} id="bk-photos-label">
                    Photos
                  </span>
                  <span className={styles.leader} aria-hidden="true" />
                  <span className={styles.hint}>Optional</span>
                </div>
                <label
                  className={`${styles.drop} ${dragging ? styles.dropActive : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                >
                  <input
                    id="bk-photos"
                    className={styles.fileInput}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onPick}
                    aria-labelledby="bk-photos-label"
                    aria-describedby={[describedBy("photos"), "bk-photos-hint"].filter(Boolean).join(" ")}
                  />
                  <Upload size={20} strokeWidth={2} aria-hidden="true" />
                  <span className={styles.dropText}>Drop photos here, or tap to choose</span>
                  <span id="bk-photos-hint" className={styles.hint}>
                    Up to {LIMITS.maxFiles} images, 8MB each
                  </span>
                </label>
                {files.length > 0 && (
                  <ul className={styles.files} aria-label="Chosen photos">
                    {files.map((f) => (
                      <li key={fileKey(f)} className={styles.file}>
                        <span className={styles.fileName}>{f.name}</span>
                        <span className={styles.fileSize}>{formatBytes(f.size)}</span>
                        <button
                          type="button"
                          className={styles.remove}
                          onClick={() => removeFile(fileKey(f))}
                          aria-label={`Remove ${f.name}`}
                        >
                          <X size={16} strokeWidth={2.5} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <PrintError id="bk-photos-err" message={shown.photos || photoNote} />
              </div>

              {/* Honeypot: hidden from people and assistive tech, tempting to bots */}
              <div className={styles.honey} aria-hidden="true">
                <label>
                  Website
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={fields.website}
                    onChange={(e) => set("website", e.target.value)}
                  />
                </label>
              </div>

              {status === "error" && (
                <p className={`${styles.err} ${styles.sendErr}`}>
                  Couldn&apos;t send. Try again, or call{" "}
                  <a href={site.phoneHref}>{site.phoneDisplay}</a>
                </p>
              )}

              <button type="submit" className={styles.submit} disabled={sending}>
                {sending ? "Printing…" : "Print ticket and send"}
              </button>
            </form>
          )}

          {sending && <span className={styles.printhead} aria-hidden="true" />}
        </div>
      </div>

      <div className="visually-hidden" role="status" aria-live="polite">
        {announce}
      </div>
    </section>
  );
}
