import { Audience } from "./Audience.jsx";
import { Compare } from "./Compare.jsx";
import { Faq } from "./Faq.jsx";
import { Features } from "./Features.jsx";
import { ClosingCta, Footer } from "./Footer.jsx";
import { Header } from "./Header.jsx";
import { Hero } from "./Hero.jsx";
import { HowItWorks } from "./HowItWorks.jsx";
import { Demo } from "./Demo.jsx";
import { Pricing } from "./Pricing.jsx";

export default function Landing() {
  return (
    <div className="bg-paper text-ink">
      <Header />
      <Hero />
      <HowItWorks />
      <Demo />
      <Features />
      <Audience />
      <Compare />
      <Pricing />
      <Faq />
      <ClosingCta />
      <Footer />
    </div>
  );
}
