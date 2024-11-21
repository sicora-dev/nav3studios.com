// App.js
import React, { useState, useEffect, Suspense, lazy } from "react";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { Route, Routes } from "react-router-dom";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import Navbar from "./components/Navbar.js";
import Home from "./pages/Home";
import Info from "./pages/Info";
import Login from "./pages/Login";
import Register from "./pages/Register";
// import Reserva from "./pages/Reserva.js";
import SuccessPayment from "./pages/SuccessPayment";
import CancelPayment from "./pages/CancelPayment";
import Account from "./pages/Account";
import VerifyEmail from "./pages/VerifyEmail.js";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import "./styles/index.css";

const Reserva = lazy(() => import("./pages/Reserva"));
const Services = lazy(() => import("./components/Services"));
const Map = lazy(() => import("./components/Map"));

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("isDarkMode") === "true";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("isDarkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("isDarkMode", "false");
    }
  }, [isDarkMode]);

  const toggleDarkMode = (checked) => {
    setIsDarkMode(checked);
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <PayPalScriptProvider
          options={{
            "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
            currency: "EUR",
          }}
        >
          <div className="flex h-screen">
            <Navbar />
            <div className="flex-1 overflow-auto md:ml-80">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/information" element={<Info />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/reserva" element={<Reserva />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="/success" element={<SuccessPayment />} />
                  <Route path="/cancel" element={<CancelPayment />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route
                    path="/verify-email/:token"
                    element={<VerifyEmail />}
                  />
                  <Route
                    path="/reset-password/:token"
                    element={<ResetPassword />}
                  />
                  <Route path="/" element={<Home />} />
                </Routes>
              </Suspense>
            </div>
            <button
              className="absolute bottom-10 right-10"
              aria-label="Cambiar modo oscuro"
            >
              <DarkModeSwitch
                checked={isDarkMode}
                onChange={toggleDarkMode}
                size={30}
                className="text-light-buttons"
                
              />
            </button>
          </div>
        </PayPalScriptProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
