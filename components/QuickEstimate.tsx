import { InstagramIcon } from "@/components/InstagramIcon";
import { placeholderContact, site } from "@/lib/site";
import styles from "./QuickEstimate.module.css";

export function QuickEstimate() {
  return (
    <section id="estimate" className={styles.section} aria-labelledby="estimate-title">
      <div className={styles.inner}>
        <div className={styles.top}>
          <h2 id="estimate-title" className={styles.h2}>
            Send a photo. Get a ballpark.
          </h2>
          <div className={styles.copy}>
            <p>
              Smaller jobs like a drywall patch, a room of paint, a tile repair or a leaky faucet
              can start in your DMs. Send a couple of photos and the room size on Instagram, and
              we can give you a rough number before anyone books a visit.
            </p>
            <p>Bigger jobs, like a full basement, need a site visit first.</p>
            <a
              className={styles.cta}
              href={site.instagramDmUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramIcon size={28} />
              DM us for a quick estimate
              <span className="visually-hidden"> (opens Instagram in a new tab)</span>
            </a>
            {placeholderContact ? (
              <p className={styles.note}>INSTAGRAM HANDLE IS A PLACEHOLDER.</p>
            ) : null}
          </div>
        </div>

        <ol className={styles.steps}>
          <li className={styles.stub}>
            <span className={styles.num} aria-hidden="true">
              1
            </span>
            <p className={styles.text}>
              <strong>Snap the job:</strong> wide shot plus close-up
            </p>
          </li>
          <li className={styles.stub}>
            <span className={styles.num} aria-hidden="true">
              2
            </span>
            <p className={styles.text}>
              <strong>DM it</strong> to {site.instagramHandle} with your area
            </p>
          </li>
          <li className={styles.stub}>
            <span className={styles.num} aria-hidden="true">
              3
            </span>
            <p className={styles.text}>
              <strong>Get a ballpark,</strong> then book a visit if it works
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}
