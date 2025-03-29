import { APPLICATION_ROUTES, MODELS_ROUTES } from "@/constants";
import { Banner } from "@/components/ui/banner";
import { Footer } from "@/components/layouts";
import { HotTracking } from "@/components/shared";
import { NavBar } from "@/components/layouts";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useScrollToTop } from "@/hooks/use-scroll-to-element";
import { useAuth } from "@/app/providers/auth-provider";
import { AuthenticationModal } from "@/components/auth";
import {
  BANNER_TIMEOUT_DURATION,
  MATOMO_TRACKING_TIMEOUT_DURATION,
} from "@/config";

export const RootLayout = () => {
  const { pathname, state } = useLocation();
  const { scrollToTop } = useScrollToTop();

  /**
   * Scroll to top on pages switch.
   */
  useEffect(() => {
    scrollToTop();
  }, [pathname]);

  const { isAuthenticated } = useAuth();
  const [showTracking, setShowTracking] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(false);

  /**
   * Show the banner after 3 seconds.
   */
  useEffect(() => {
    const bannerTimer = setTimeout(() => {
      setShowBanner(true);
    }, BANNER_TIMEOUT_DURATION);

    return () => clearTimeout(bannerTimer);
  }, []);

  /**
   * Get the model id from the URL. If it exists,
   * we can safely assume the user is in edit mode.
   * Therefore, we can disable the footer.
   */
  const { modelId } = useParams();

  /**
   * Show the tracking 3 seconds after the page renders.
   */
  useEffect(() => {
    /**
     * Tracking component can show only on these public pages.
     * It can only show up on these pages, and when it shows up, it won't close until the user choose an action,
     * even if they navigate to other routes.
     * However, if the user navigates to a route not listed here, it won't show up.
     */
    const canShowTracker = [
      APPLICATION_ROUTES.LEARN,
      APPLICATION_ROUTES.MODELS,
      APPLICATION_ROUTES.RESOURCES,
      APPLICATION_ROUTES.HOMEPAGE,
    ];

    const timer = setTimeout(() => {
      if (canShowTracker.some((route) => pathname === route)) {
        setShowTracking(true);
      }
    }, MATOMO_TRACKING_TIMEOUT_DURATION);

    return () => clearTimeout(timer);
  });

  return (
    <>
      <HotTracking showTracking={showTracking} />
      {/* Show the auth modal when a `backgroundLocation` is set and when the user is not authenticated. */}
      <AuthenticationModal
        isOpen={state?.backgroundLocation && !isAuthenticated}
      />
      <main className="min-h-screen relative flex flex-col">
        {!pathname.includes(APPLICATION_ROUTES.AUTH_CALLBACK) &&
          !pathname.includes(APPLICATION_ROUTES.START_MAPPING_BASE) &&
          !pathname.includes(MODELS_ROUTES.CREATE_MODEL_BASE) &&
          !modelId && <>{showBanner && <Banner />}</>}

        {!pathname.includes(APPLICATION_ROUTES.AUTH_CALLBACK) &&
          !pathname.includes(APPLICATION_ROUTES.START_MAPPING_BASE) && (
            <>
              <NavBar />
            </>
          )}

        <div
          // Disable global padding on landing page.
          className={`min-h-screen mx-auto w-full ${pathname === APPLICATION_ROUTES.HOMEPAGE ? "" : "app-padding"} ${pathname.includes(MODELS_ROUTES.CREATE_MODEL_BASE) || modelId ? "bg-frosted-blue" : ""}`}
        >
          <Outlet />
        </div>
        {!pathname.includes(APPLICATION_ROUTES.START_MAPPING_BASE) &&
          !pathname.includes(MODELS_ROUTES.CREATE_MODEL_BASE) &&
          !modelId &&
          !pathname.includes(APPLICATION_ROUTES.AUTH_CALLBACK) && <Footer />}
      </main>
    </>
  );
};
