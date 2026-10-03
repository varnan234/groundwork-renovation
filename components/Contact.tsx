import { placeholderContact, site } from "@/lib/site";
import { tradeById } from "@/lib/trades";
import styles from "./Contact.module.css";

type Line = {
  label: string;
  value: string;
  href: string;
  /** Visually hidden lead-in so the link's name carries the method. */
  sr: string;
  colour: string;
  external?: boolean;
  textHref?: string;
};

const lines: Line[] = [
  {
    label: "Call or text",
    sr: "Call ",
    value: site.phoneDisplay,
    href: site.phoneHref,
    textHref: site.smsHref,
    colour: tradeById.painting.ramp[3],
  },
  {
    label: "Email",
    sr: "Email ",
    value: site.email,
    href: `mailto:${site.email}`,
    colour: tradeById.tiling.ramp[3],
  },
  {
    label: "Instagram DM",
    sr: "Instagram DM ",
    value: site.instagramHandle,
    href: site.instagramDmUrl,
    colour: tradeById.plumbing.ramp[3],
    external: true,
  },
];

export function Contact() {
  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-title">
      <div className={styles.inner}>
        <h2 id="contact-title" className={styles.h2}>
          Talk to a person.
        </h2>
        {placeholderContact ? (
          <p className={styles.placeholder}>
            PLACEHOLDER DETAILS. SWAP IN THE REAL PHONE, EMAIL AND INSTAGRAM BEFORE LAUNCH.
          </p>
        ) : null}

        <ul className={styles.board}>
          {lines.map((line) => (
            <li
              key={line.label}
              className={styles.line}
              style={{ "--fill": line.colour } as React.CSSProperties}
            >
              <span className={styles.fill} aria-hidden="true" />
              <span className={styles.name}>{line.label}</span>
              <span className={styles.leader} aria-hidden="true" />
              <span className={styles.value}>
                <a
                  className={styles.link}
                  href={line.href}
                  {...(line.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <span className="visually-hidden">{line.sr}</span>
                  {line.value}
                  {line.external ? (
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  ) : null}
                </a>
                {line.textHref ? (
                  <a className={styles.alt} href={line.textHref}>
                    Text instead
                    <span className="visually-hidden"> to {line.value}</span>
                  </a>
                ) : null}
              </span>
            </li>
          ))}
        </ul>

        <div className={styles.foot}>
          <p className={styles.area}>Serving the {site.area}.</p>
          <a className={styles.book} href="#book">
            Book a service
          </a>
        </div>
      </div>
    </section>
  );
}
