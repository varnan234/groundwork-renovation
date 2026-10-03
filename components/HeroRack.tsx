import { trades } from "@/lib/trades";
import { ChipStrip } from "./ChipStrip";
import { TicketSummary } from "./TicketSummary";
import { MobileTicketBar } from "./MobileTicketBar";
import { StickyTicket } from "./StickyTicket";
import styles from "./HeroRack.module.css";

export function HeroRack() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.inner}>
        <h1 id="hero-title" className={styles.title}>
          Pick the job. We&rsquo;ll come quote it.
        </h1>
        <p className={styles.lead}>
          Basement renovations, framing, drywall, painting, flooring, tile and plumbing across the Greater Toronto
          Area. Pull the jobs you need off the rack.
        </p>

        <div className={styles.stage}>
          <div className={styles.rack} role="group" aria-label="Services rack" data-ground="dark">
            <ul className={styles.strips}>
              {trades.map((trade, i) => (
                <ChipStrip key={trade.id} trade={trade} index={i} />
              ))}
            </ul>
          </div>

          <div className={styles.ticketSlot}>
            <TicketSummary />
          </div>
        </div>
      </div>

      <MobileTicketBar />
      <StickyTicket />
    </section>
  );
}
