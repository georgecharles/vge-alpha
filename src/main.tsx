import React from "react";
    import ReactDOM from "react-dom/client";
    import App from "./App.tsx";
    import "./index.css";
    import { BrowserRouter } from "react-router-dom";

    import { TempoDevtools } from "tempo-devtools";
    import { AuthProvider } from "./lib/auth";
    import posthog from "posthog-js";

    TempoDevtools.init();

    posthog.init(
      "phc_Pg1VGdZoazG7KyDNxnUXNZZz6zPVrGNSRtFlDnlZCcA",
      {
        api_host: "https://eu.i.posthog.com",
        person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
      },
    );

    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </React.StrictMode>,
    );
