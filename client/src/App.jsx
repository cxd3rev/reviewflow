import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/layout/Layout.jsx";
import Billing from "./pages/app/Billing.jsx";
import Customers from "./pages/app/Customers.jsx";
import Dashboard from "./pages/app/Dashboard.jsx";
import Jobs from "./pages/app/Jobs.jsx";
import Requests from "./pages/app/Requests.jsx";
import Settings from "./pages/app/Settings.jsx";
import Login from "./pages/auth/Login.jsx";
import Onboarding from "./pages/auth/Onboarding.jsx";
import Signup from "./pages/auth/Signup.jsx";
import Landing from "./pages/landing/Landing.jsx";

function Protected({ children }) {
  const { user, business, loading } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  if (business && !business.onboardingComplete) return <Navigate to="/onboarding" replace />;
  return children;
}

function OnboardingGate() {
  const { user, business, loading } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  if (business?.onboardingComplete) return <Navigate to="/app" replace />;
  return <Onboarding />;
}

function PublicOnly({ children }) {
  const { user, business, loading } = useAuth();
  if (loading) return <Splash />;
  if (user && business && !business.onboardingComplete) return <Navigate to="/onboarding" replace />;
  if (user) return <Navigate to="/app" replace />;
  return children;
}

function Splash() {
  return <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-muted">Loading…</div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnly>
            <Signup />
          </PublicOnly>
        }
      />
      <Route path="/onboarding" element={<OnboardingGate />} />
      <Route
        path="/app"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="requests" element={<Requests />} />
        <Route path="settings" element={<Settings />} />
        <Route path="billing" element={<Billing />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
