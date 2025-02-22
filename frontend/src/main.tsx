import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";

import { App } from "@/app";
import "@/styles/hot-sl.css";
import "@/styles/index.css";

import ContextProviders from "./app/providers";
import { MainErrorFallback } from "./components/errors";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      <ContextProviders>
        <App />
      </ContextProviders>
    </ErrorBoundary>
  </StrictMode>
);
