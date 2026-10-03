import { SiteNav } from "@/components/SiteNav";
import { HeroRack } from "@/components/HeroRack";
import { TradeDeck } from "@/components/TradeDeck";
import { QuickEstimate } from "@/components/QuickEstimate";
import { About } from "@/components/About";
import { BookingTicket } from "@/components/BookingTicket";
import { Contact } from "@/components/Contact";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#book">
        Skip to booking
      </a>
      <SiteNav />
      <main id="main">
        <HeroRack />
        <TradeDeck />
        <QuickEstimate />
        <About />
        <BookingTicket />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
