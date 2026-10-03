"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { tradeById } from "@/lib/trades";
import { useRack } from "./RackProvider";
import styles from "./StickyTicket.module.css";

const HERO_TICKET = "[data-hero-ticket]";

/**
 * A compact copy of the request ticket that rides at the bottom right once the hero ticket has scrolled away,
 * so "Add to ticket" further down the page still prints somewhere you can see. Hidden under 760px, where the
 * mobile bar does the same job.
 */
export function StickyTicket() {
  const { pulled } = useRack();
  const count = pulled.length;
  const recent = pulled.slice(-3);
  const older = count - recent.length;

  // Assume the hero ticket is in view until the observer says otherwise, so it never flashes in on load.
  const [heroInView, setHeroInView] = useState(true);
  const [bookInView, setBookInView] = useState(false);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const hero = document.querySelector(HERO_TICKET);
    const book = document.getElementById("book");
    const observers: IntersectionObserver[] = [];

    if (hero) {
      // The sticky nav covers the top 64px, so a ticket tucked under it counts as out of view.
      const io = new IntersectionObserver(([e]) => setHeroInView(e.isIntersecting), {
        rootMargin: "-64px 0px 0px 0px",
      });
      io.observe(hero);
      observers.push(io);
    } else {
      setHeroInView(false);
    }
    if (book) {
      const io = new IntersectionObserver(([e]) => setBookInView(e.isIntersecting), {
        rootMargin: "0px 0px -80px 0px",
      });
      io.observe(book);
      observers.push(io);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const visible = count > 0 && !heroInView && !bookInView;

  return (
    <aside className={styles.wrap} data-visible={visible} inert={!visible} aria-label="Request ticket summary">
      <div className={styles.ticket}>
        <div className={styles.paper}>
          <p className={styles.head}>
            REQUEST TICKET &middot;{" "}
            <span key={count} className={styles.tick}>
              {count}
            </span>{" "}
            {count === 1 ? "JOB" : "JOBS"}
          </p>
          <hr className={styles.rule} />
          <ul className={styles.lines}>
            {recent.map((id) => {
              const t = tradeById[id];
              return (
                <li key={id} className={styles.line} style={{ "--sw": t.ramp[3] } as CSSProperties}>
                  <span className={styles.swatch} aria-hidden="true" />
                  <span className={styles.code}>{t.code}</span>
                  <span className={styles.name}>{t.name}</span>
                </li>
              );
            })}
          </ul>
          {older > 0 && <p className={styles.more}>+ {older} more</p>}
          <a className={styles.cta} href="#book">
            Book these jobs
          </a>
        </div>
      </div>
    </aside>
  );
}
