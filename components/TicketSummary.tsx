"use client";

import { tradeById } from "@/lib/trades";
import { site } from "@/lib/site";
import { useRack } from "./RackProvider";
import { InstagramIcon } from "./InstagramIcon";
import styles from "./TicketSummary.module.css";

/** The request ticket pinned beside the rack. Pulled strips print onto it, one line each. */
export function TicketSummary() {
  const { pulled } = useRack();
  const count = pulled.length;

  return (
    <aside className={styles.ticket} aria-label="Request ticket" data-hero-ticket>
      <span className={styles.tape} aria-hidden="true" />
      <div className={styles.paper}>
        <p className={styles.head}>REQUEST TICKET</p>
        <p className={styles.shop}>{site.name}</p>
        <hr className={styles.rule} />

        {count === 0 ? (
          <p className={styles.empty}>Pull a strip off the rack to add it.</p>
        ) : (
          <ul className={styles.lines}>
            {pulled.map((id) => {
              const t = tradeById[id];
              return (
                <li key={id} className={styles.line}>
                  <span className={styles.lineCode}>{t.code}</span>
                  <span>{t.name}</span>
                </li>
              );
            })}
          </ul>
        )}

        <hr className={styles.rule} />
        <p className={styles.count} aria-live="polite">
          {count} {count === 1 ? "job" : "jobs"} on ticket
        </p>

        <a className={styles.cta} href="#book">
          {count > 0 ? "Book these jobs" : "Book a service"}
        </a>
        <a className={styles.dm} href={site.instagramDmUrl} target="_blank" rel="noopener noreferrer">
          <InstagramIcon size={18} />
          <span>
            DM a photo for a quick estimate
            <span className="visually-hidden"> (opens Instagram in a new tab)</span>
          </span>
        </a>
      </div>
    </aside>
  );
}
