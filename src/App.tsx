import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Payment from "./pages/payment";
import SimpleNavigation from "./components/SimpleNavigation";
import LoginNavigation from "./components/LoginNavigation";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {isLoginPage ? <LoginNavigation /> : <SimpleNavigation />}
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </>
  );
}

export default App;
