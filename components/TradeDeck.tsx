"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, Check, Plus } from "lucide-react";
import { trades, type Trade } from "@/lib/trades";
import { useRack } from "@/components/RackProvider";
import styles from "./TradeDeck.module.css";

/* Pick light or dark text for a band from its ground colour, so every band
   clears 4.5:1 without a per-trade table. Card and ink match globals.css. */
const CARD = "#fbfbf8";
const INK = "#1d1c1a";

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function textToneFor(ground: string): "light" | "dark" {
  const l = luminance(ground);
  const withCard = (luminance(CARD) + 0.05) / (l + 0.05);
  const withInk = (l + 0.05) / (luminance(INK) + 0.05);
  return withCard >= withInk ? "light" : "dark";
}

function Band({ trade, flip }: { trade: Trade; flip: boolean }) {
  const { isPulled, toggle, pull } = useRack();
  const pulled = isPulled(trade.id);
  const tone = textToneFor(trade.ramp[3]);
  const [c1, c2, c3, c4, c5] = trade.ramp;
  const style = {
    "--c1": c1,
    "--c2": c2,
    "--c3": c3,
    "--c4": c4,
    "--c5": c5,
  } as React.CSSProperties;

  return (
    <article
      className={`${styles.band} ${flip ? styles.flip : ""}`}
      style={style}
      data-tone={tone}
      data-ground={tone === "light" ? "dark" : undefined}
      aria-labelledby={`trade-${trade.id}`}
    >
      <div className={styles.swatches} data-swatches aria-hidden="true">
        <span style={{ background: c1 }} />
        <span style={{ background: c2 }} />
        <span style={{ background: c3 }} />
        <span style={{ background: c4 }} />
        <span style={{ background: c5 }} />
      </div>

      <div className={styles.inner}>
        <div className={styles.name}>
          <div className={styles.head}>
            <h3 id={`trade-${trade.id}`} className={styles.title}>
              {trade.name}
            </h3>
            <p className={styles.code}>{trade.code}</p>
          </div>
          <p className={styles.lead}>{trade.line}</p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.add}
              aria-pressed={pulled}
              onClick={() => toggle(trade.id)}
            >
              {pulled ? (
                <>
                  On ticket <Check size={20} strokeWidth={2.75} aria-hidden="true" />
                </>
              ) : (
                <>
                  Add to ticket <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
                </>
              )}
            </button>
            <a className={styles.book} href="#book" onClick={() => pull(trade.id)}>
              Book this job <ArrowRight size={18} strokeWidth={2.5} aria-hidden="true" />
            </a>
          </div>
        </div>

        <dl className={styles.spec}>
          <div className={styles.row}>
            <dt>TYPICAL SCOPE</dt>
            <dd>
              <ul className={styles.list}>
                {trade.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div className={styles.row}>
            <dt>HOW WE QUOTE</dt>
            <dd>{trade.quote}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export function TradeDeck() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    // Observe each band, not its swatch column: Chrome applies clip-path when computing
    // intersection, so a fully clipped column would never report as visible.
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-swatches]"))
      .map((el) => el.parentElement)
      .filter((el): el is HTMLElement => el !== null);
    root.setAttribute("data-js", "");

    if (typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.setAttribute("data-inview", ""));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-inview", "");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="services" ref={ref} className={styles.deck} aria-labelledby="services-title">
      <div className={styles.intro}>
        <div className={styles.introInner}>
          <h2 id="services-title" className={styles.h2}>
            Everything on the rack
          </h2>
          <p className={styles.introCopy}>
            Seven trades, flipped over so you can read the back. Add the jobs you need to your
            ticket and send them in one request.
          </p>
        </div>
      </div>

      {trades.map((trade, i) => (
        <Band key={trade.id} trade={trade} flip={i % 2 === 1} />
      ))}
    </section>
  );
}
