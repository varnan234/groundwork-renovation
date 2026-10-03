"use client";

import { useId, type CSSProperties } from "react";
import type { Trade } from "@/lib/trades";
import { useRack } from "./RackProvider";
import styles from "./ChipStrip.module.css";

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Where the vertical name switches from ink to the lightest ramp step, as a share of the blocks' height.
 * Blocks flex 1:1:1:1:1.6, so three blocks end at 3/5.6 and four at 4/5.6. Step 4 only counts as "light"
 * when ink reads better on it than ramp[0] does (framing ochre, drywall grey).
 */
function inkSplit(ramp: Trade["ramp"]) {
  const inkOnFourth = contrast("#1d1c1a", ramp[3]) >= contrast(ramp[0], ramp[3]);
  return inkOnFourth ? "71.4286%" : "53.5714%";
}

type Props = {
  trade: Trade;
  /** Position on the rack, used to stagger the load-in. */
  index: number;
};

/** One paint-chip strip: a button card that pulls off the rack onto the ticket. */
export function ChipStrip({ trade, index }: Props) {
  const { isPulled, toggle } = useRack();
  const pulled = isPulled(trade.id);
  const lineId = useId();

  const style = {
    "--c1": trade.ramp[0],
    "--c2": trade.ramp[1],
    "--c3": trade.ramp[2],
    "--c4": trade.ramp[3],
    "--c5": trade.ramp[4],
    "--i": index,
    "--split": inkSplit(trade.ramp),
  } as CSSProperties;

  return (
    <li className={styles.slot} style={style}>
      <button
        type="button"
        className={styles.strip}
        aria-pressed={pulled}
        aria-label={`${trade.name}, ${trade.code}, ${pulled ? "on ticket" : "not on ticket"}`}
        aria-describedby={lineId}
        onClick={() => toggle(trade.id)}
      >
        <span className={styles.shadow} aria-hidden="true" />
        <span className={styles.card}>
          <span className={styles.blocks}>
            <span className={styles.block} />
            <span className={styles.block} />
            <span className={styles.block} />
            <span className={styles.block} />
            <span className={styles.block}>
              <span id={lineId} className={styles.line}>
                {trade.line}
              </span>
            </span>
            {/* Tall strips: the trade name runs up the spine, ink over the light blocks and ramp[0] over the dark. */}
            <span className={`${styles.spine} ${styles.spineInk}`} aria-hidden="true">
              <span className={styles.spineName}>{trade.name}</span>
            </span>
            <span className={`${styles.spine} ${styles.spineLight}`} aria-hidden="true">
              <span className={styles.spineName}>{trade.name}</span>
            </span>
          </span>
          <span className={styles.label} aria-hidden="true">
            <span className={styles.name}>{trade.name}</span>
            <span className={styles.code}>{trade.code}</span>
          </span>
        </span>
        <span className={styles.ring} aria-hidden="true" />
        <span className={styles.stamp} aria-hidden="true">
          ON TICKET
        </span>
      </button>
    </li>
  );
}
