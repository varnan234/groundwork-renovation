"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { useRack } from "./RackProvider";
import { InstagramIcon } from "./InstagramIcon";
import styles from "./MobileTicketBar.module.css";

// The bar steps aside where the booking form or the contact block already own the bottom of the screen.
const QUIET_SECTIONS = ["book", "contact"];

/** Sticky bottom bar for phones: ticket count, Book, and an Instagram DM shortcut. */
export function MobileTicketBar() {
  const { pulled } = useRack();
  const count = pulled.length;
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const targets = QUIET_SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (targets.length === 0 || !("IntersectionObserver" in window)) return;

    const inView = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inView.add(entry.target);
          else inView.delete(entry.target);
        }
        setHidden(inView.size > 0);
      },
      // Shrink the bottom edge so the bar hides as the section reaches it, not a screen early.
      { rootMargin: "0px 0px -72px 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={styles.bar}
      data-ground="dark"
      data-hidden={hidden}
      inert={hidden}
      role="region"
      aria-label="Request ticket"
    >
      <p className={count > 0 ? `${styles.status} ${styles.statusCount}` : styles.status} aria-live="polite">
        {count > 0 ? `${count} ${count === 1 ? "job" : "jobs"} on ticket` : "Book a service"}
      </p>
      <a className={styles.book} href="#book">
        Book
      </a>
      <a
        className={styles.dm}
        href={site.instagramDmUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="DM a photo on Instagram for a quick estimate (opens in a new tab)"
      >
        <InstagramIcon size={22} />
      </a>
    </div>
  );
}
