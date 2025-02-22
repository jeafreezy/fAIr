import {
  CallToAction,
  CoreFeatures,
  Corevalues,
  Header,
  Kpi,
  TaglineBanner,
  TheFAIRProcess,
  WhatIsFAIR,
} from "@/components/landing";
import { Head } from "@/components/seo";
import { FAQs } from "@/components/shared";

export const LandingPage = () => {
  return (
    <>
      <Head title="Home" />
      <Header />
      <Kpi />
      <WhatIsFAIR />
      <TheFAIRProcess />
      <CoreFeatures />
      <Corevalues />
      <section className="app-padding">
        <FAQs />
      </section>
      <TaglineBanner />
      <CallToAction />
    </>
  );
};
