import { Camera } from "lucide-react";
import { InstagramIcon } from "@/components/InstagramIcon";
import { site } from "@/lib/site";
import { tradeById } from "@/lib/trades";
import styles from "./About.module.css";

export function About() {
  return (
    <section
      id="about"
      className={styles.section}
      data-ground="dark"
      aria-labelledby="about-title"
    >
      <div className={styles.inner}>
        <figure className={styles.figure}>
          <div
            className={styles.photo}
            style={{ background: tradeById.basement.ramp[2] }}
            role="img"
            aria-label="Placeholder for a portrait photo"
          >
            <Camera size={56} strokeWidth={1.75} aria-hidden="true" />
          </div>
          <figcaption className={styles.caption}>
            PLACEHOLDER: replace with a photo of {site.ownerName} on a job.
          </figcaption>
        </figure>

        <div className={styles.copy}>
          <h2 id="about-title" className={styles.h2}>
            Who&apos;s doing the work.
          </h2>
          <div className={styles.body}>
            <p>
              <span className={styles.note}>{site.ownerName}</span> runs {site.shortName}, taking on
              basements, framing, drywall, paint, floors, tile and plumbing across{" "}
              {site.areaShort}.
            </p>
            <p>
              <span className={styles.note}>
                [Confirm with the owner: does the same crew handle every trade? If so, say it
                here, e.g. &ldquo;one crew from the first stud to the last coat.&rdquo;]
              </span>
            </p>
            <p>
              <span className={styles.note}>
                [Add years in trade, licences and insurance details once confirmed.]
              </span>
            </p>
          </div>
          <a
            className={styles.link}
            href={site.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <InstagramIcon size={24} />
            <span>
              See recent jobs on Instagram {site.instagramHandle}
              <span className="visually-hidden"> (opens in a new tab)</span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
