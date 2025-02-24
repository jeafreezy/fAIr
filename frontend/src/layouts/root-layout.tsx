import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { Footer } from "@/components/layout";
import { NavBar } from "@/components/layout";
import { HotTracking } from "@/components/shared";
import { Banner } from "@/components/ui/banner";
import { APPLICATION_ROUTES } from "@/constants";
import { useScrollToTop } from "@/hooks/use-scroll-to-element";

export const RootLayout = () => {
  const { pathname } = useLocation();
  const { scrollToTop } = useScrollToTop();
  // Scroll to top on pages switch.
  useEffect(() => {
    scrollToTop();
  }, [pathname, scrollToTop]);

  return (
    <>
      <HotTracking />
      <main className="relative mx-auto  flex min-h-screen flex-col justify-between">
        <Banner />
        {!pathname.includes(APPLICATION_ROUTES.START_MAPPING_BASE) && (
          <NavBar />
        )}

        <div
          // Disable global padding on landing page.
          className={`${pathname === APPLICATION_ROUTES.HOMEPAGE ? "" : "app-padding"} w-full`}
        >
          <Outlet />
        </div>
        {!pathname.includes(APPLICATION_ROUTES.START_MAPPING_BASE) && (
          <Footer />
        )}
      </main>
    </>
  );
};
