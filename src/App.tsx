import { Routes, Route, useLocation } from "react-router-dom";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Payment from "./pages/payment";
import ResetPassword from "./pages/reset-password";
import AuthCallback from "./pages/auth-callback";
import CompleteProfile from "./pages/complete-profile";
import Onboarding from "./pages/onboarding";
import Home from "./pages/home";
import SimpleNavigation from "./components/SimpleNavigation";
import LoginNavigation from "./components/LoginNavigation";
import Footer from "./components/shared/Footer";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTCRStatus from "./pages/admin/AdminTCRStatus";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isResetPasswordPage = location.pathname === "/reset-password";
  const isDashboardPage = location.pathname === "/dashboard";
  const isCompleteProfilePage = location.pathname === "/complete-profile";
  const isOnboardingPage = location.pathname === "/onboarding";
  const isHomePage = location.pathname === "/";
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {isLoginPage || isResetPasswordPage ? (
        <LoginNavigation />
      ) : isDashboardPage ||
        isCompleteProfilePage ||
        isOnboardingPage ||
        isAdminPage ? null : (
        <SimpleNavigation />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payment" element={<Payment />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        } />
        <Route path="/admin/tcr-status" element={
          <AdminRoute>
            <AdminTCRStatus />
          </AdminRoute>
        } />
      </Routes>
      
      {/* Add footer to all pages except home and admin (which have their own) */}
      {!isHomePage && !isAdminPage && <Footer brand="gnymble" variant="minimal" />}
    </>
  );
}

export default App;
