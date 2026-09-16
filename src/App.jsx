import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query"; // Added useQuery here
import Login from "./components/Login";
import { authApi } from "./api/api";
import { DashboardLayout } from "./components/layout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";
import ErrorBoundary from "./components/ErrorBoundary";
import OnboardingClient from "./pages/OnboardingClient";
import ClientApikeys from "./pages/ClientApikeys";
import GenerateKeyForClient from "./pages/GenerateKeyForClient";

const OverviewPage = lazy(() =>
  import("./pages/OverviewPage").then((m) => ({ default: m.OverviewPage })),
);
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);

const pageFallback = (
  <div style={{ height: "60vh", display: "grid", placeItems: "center" }}>
    Loading…
  </div>
);

// --- NEW COMPONENT: Role Guard ---
function SuperAdminRoute({ children }) {
  // Fetch the user profile to check their role
  const { data: profile, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: authApi.getProfile,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div style={{ height: "60vh", display: "grid", placeItems: "center" }}>
        Verifying permissions...
      </div>
    );
  }

  // Extract the role from the profile data
  const userRole = profile?.data?.role;
  const isSuperAdmin = userRole === "super_admin" || userRole === "SUPER_ADMIN";

  // If they are not a super admin, redirect them back to the dashboard
  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  // If they are a super admin, render the requested page
  return children;
}
// ---------------------------------

function AuthGate() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const controller = new AbortController();
    authApi
      .getProfile({ signal: controller.signal })
      .then(() => setIsAuthenticated(true))
      .catch((err) => {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setIsAuthenticated(false);
        }
      });
    return () => controller.abort();
  }, []);

  const handleLoginSuccess = () => setIsAuthenticated(true);

  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {}
    queryClient.clear();
    setIsAuthenticated(false);
  }, [queryClient]);

  useEffect(() => {
    if (isAuthenticated !== true) return;
    const handle401 = () => {
      queryClient.clear();
      setIsAuthenticated(false);
    };
    window.addEventListener("auth:unauthorized", handle401);
    return () => window.removeEventListener("auth:unauthorized", handle401);
  }, [isAuthenticated, queryClient]);

  if (isAuthenticated === null) {
    return (
      <div style={{ height: "100vh", display: "grid", placeItems: "center" }}>
        <div>Checking authentication…</div>
        <div>Connecting to Backend</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <DashboardLayout onLogout={handleLogout}>
      <Suspense fallback={pageFallback}>
        <Routes>
          <Route path="/" element={<OverviewPage />} />

          {/* --- PROTECTED ROUTE --- */}
          <Route
            path="/onboarding"
            element={
              <SuperAdminRoute>
                <OnboardingClient />
              </SuperAdminRoute>
            }
          />
          <Route
            path="/generate-key-for-client"
            element={
              <SuperAdminRoute>
                <GenerateKeyForClient />
              </SuperAdminRoute>
            }
          />

          <Route path="/client-api-keys" element={<ClientApikeys />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <AuthGate />
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
