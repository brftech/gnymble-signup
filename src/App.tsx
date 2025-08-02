import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Payment from "./pages/payment";
import ResetPassword from "./pages/reset-password";
import AuthCallback from "./pages/auth-callback";
import CompleteProfile from "./pages/complete-profile";
import Onboarding from "./pages/onboarding";
import SimpleNavigation from "./components/SimpleNavigation";
import LoginNavigation from "./components/LoginNavigation";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isResetPasswordPage = location.pathname === "/reset-password";
  const isDashboardPage = location.pathname === "/dashboard";
  const isCompleteProfilePage = location.pathname === "/complete-profile";
  const isOnboardingPage = location.pathname === "/onboarding";

  return (
    <>
      {isLoginPage || isResetPasswordPage ? (
        <LoginNavigation />
      ) : isDashboardPage ||
        isCompleteProfilePage ||
        isOnboardingPage ? null : (
        <SimpleNavigation />
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </>
  );
}

export default App;
