"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { site } from "@/lib/site";
import { useRack } from "./RackProvider";
import { InstagramIcon } from "./InstagramIcon";
import styles from "./SiteNav.module.css";

const links = [
  { href: "#services", label: "Services" },
  { href: "#estimate", label: "Quick estimate" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
] as const;

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const { pulled } = useRack();
  const count = pulled.length;

  // Hairline under the bar once the page has moved.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile panel on Escape, on an outside tap, and when the layout grows past mobile.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const mq = window.matchMedia("(min-width: 760px)");
    const onMq = () => mq.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    mq.addEventListener("change", onMq);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  return (
    <header ref={headerRef} className={styles.nav} data-scrolled={scrolled} data-open={open}>
      <div className={styles.bar}>
        <a className={styles.brand} href="/">
          <span className={styles.mark} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className={styles.wordmark}>{site.name}</span>
        </a>

        <nav className={styles.menu} aria-label="Primary">
          <ul id={panelId} className={styles.links}>
            {links.map((l) => (
              <li key={l.href}>
                <a className={styles.link} href={l.href} onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              </li>
            ))}
            <li className={styles.igItem}>
              <a
                className={`${styles.link} ${styles.ig}`}
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram, ${site.instagramHandle}`}
              >
                <InstagramIcon size={22} />
                <span className={styles.igText}>Instagram</span>
              </a>
            </li>
          </ul>
        </nav>

        <div className={styles.actions}>
          <a
            className={styles.book}
            href="#book"
            onClick={() => setOpen(false)}
            aria-label={count > 0 ? `Book a service, ${count} ${count === 1 ? "job" : "jobs"} on your ticket` : undefined}
          >
            Book a service
            {count > 0 && (
              <span className={styles.badge} aria-hidden="true">
                &middot; {count}
              </span>
            )}
          </a>
          <button
            ref={menuButtonRef}
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={24} strokeWidth={2} aria-hidden="true" /> : <Menu size={24} strokeWidth={2} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
