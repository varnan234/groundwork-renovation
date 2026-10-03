# Groundwork Renovation Co. (working name)

A one-page site for a GTA renovation contractor. It covers basement renovation, framing, drywall repair, painting, flooring, tiling and plumbing.

The design idea is a hardware-store paint counter. Each trade is a paint-chip strip on a rack. Visitors pull the strips for the jobs they need, those strips print onto a request ticket, and the ticket is the booking form.

## Run it

```bash
npm install
npm run dev        # http://localhost:3100
npm run build && npm start
```

## Replace before launch

All contact details live in **`lib/site.ts`**:

| What | Where |
|---|---|
| Business name, phone, email | `lib/site.ts` |
| Instagram handle, profile URL, DM link (`https://ig.me/m/<handle>`) | `lib/site.ts` |
| Owner name | `lib/site.ts` (`ownerName`) |
| Owner photo (currently a captioned placeholder) | `components/About.tsx` |
| Bio paragraphs, and years, licences and insurance (bracketed) | `components/About.tsx` |
| Trade descriptions and "typical scope" lists (confirm with the owner, especially plumbing, which in Ontario may need a licensed plumber for some work) | `lib/trades.ts` |
| "Does the same crew handle every trade?" (bracketed note in About) | `components/About.tsx` |
| Placeholder markers on Contact and Quick estimate (set `placeholderContact` to `false`) | `lib/site.ts` |

The Instagram links currently point at instagram.com itself, not at a guessed handle, so nobody's DMs can reach a stranger's account.

The site makes no claims about reviews, years in business, licensing or response times. Add those only once they're real.

## Booking requests

The form posts to `app/api/book/route.ts`, which validates the request and then:

- if `BOOKING_FORWARD_URL` is set (e.g. a Formspree endpoint), forwards it as JSON, and the owner gets it by email;
- otherwise logs it to the server console (development only).

Copy `.env.example` to `.env.local` and set `BOOKING_FORWARD_URL` before deploying. Photo attachments aren't uploaded yet: the form sends only file names and points people to Instagram DM for photos.

## Structure

- `app/page.tsx` sets the section order: rack hero, service deck, quick estimate, about, booking ticket, contact.
- `components/RackProvider.tsx` holds the shared "pulled strips" state used by the rack, the deck and the form.
- `app/globals.css` holds the design tokens.

## How it was made

This site was vibe coded: built by prompting an AI coding assistant rather than writing every line by hand, then checked in a browser and iterated on. Read the code before relying on it for anything important. Treat the copy, service descriptions and contact details as placeholders until the owner has signed off on them.
