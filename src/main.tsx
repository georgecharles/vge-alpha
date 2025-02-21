import React from "react";
    import ReactDOM from "react-dom/client";
    import App from "./App.tsx";
    import "./index.css";
    import { BrowserRouter } from "react-router-dom";

    import { TempoDevtools } from "tempo-devtools";
    import { AuthProvider } from "./lib/auth";
    import posthog from 'posthog-js'
    import { ClerkProvider } from "@clerk/clerk-react";

    TempoDevtools.init();

    posthog.init('phc_Pg1VGdZoazG7KyDNxnUXNZZz6zPVrGNSRtFlDnlZCcA',
        {
            api_host: 'https://eu.i.posthog.com',
            person_profiles: 'identified_only' // or 'always' to create profiles for anonymous users as well
        }
    )

    const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

    if (!clerkPubKey) {
      throw new Error("VITE_CLERK_PUBLISHABLE_KEY is not defined");
    }

    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <ClerkProvider publishableKey={clerkPubKey}>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </ClerkProvider>
      </React.StrictMode>,
    );
