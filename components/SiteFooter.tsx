import { InstagramIcon } from "@/components/InstagramIcon";
import { site } from "@/lib/site";
import { trades } from "@/lib/trades";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} data-ground="dark">
      <div className={styles.edge} aria-hidden="true">
        {trades.map((t) => (
          <span key={t.id} style={{ background: t.ramp[3] }} />
        ))}
      </div>

      <div className={styles.inner}>
        <div className={styles.brand}>
          <p className={styles.wordmark}>{site.name}</p>
          <a
            className={styles.ig}
            href={site.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <InstagramIcon size={22} />
            {site.instagramHandle}
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </div>

        <nav className={styles.col} aria-label="Trades">
          <p className={styles.colTitle}>Trades</p>
          <ul className={`${styles.list} ${styles.trades}`}>
            {trades.map((t) => (
              <li key={t.id}>
                <a href="#services">{t.name}</a>
              </li>
            ))}
          </ul>
        </nav>

        <nav className={styles.col} aria-label="Contact">
          <p className={styles.colTitle}>Contact</p>
          <ul className={styles.list}>
            <li>
              <a href={site.phoneHref}>Call {site.phoneDisplay}</a>
            </li>
            <li>
              <a href={site.smsHref}>Text {site.phoneDisplay}</a>
            </li>
            <li>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
            <li>
              <a href={site.instagramDmUrl} target="_blank" rel="noopener noreferrer">
                Instagram DM
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className={styles.legal}>
        <p>
          &copy; {year} {site.name}
        </p>
        <p className={styles.mono}>Placeholder contact details, to be replaced before launch.</p>
      </div>
    </footer>
  );
}
