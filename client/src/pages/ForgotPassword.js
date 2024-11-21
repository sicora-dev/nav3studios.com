import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";
import LoadingSpinner from "../components/LoadingSpinner";

function ForgotPassword() {
  const [activeDiv, setActiveDiv] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [mode, setMode] = useState(null);

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();

  const navigate = useNavigate();

  const handleMouseMove = (e, id) => {
    if (activeDiv !== id) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = (id) => {
    setActiveDiv(id);
    setOpacity(1);
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 1000);
  };

  const handleMouseLeave = () => {
    setActiveDiv(null);
    setOpacity(0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/forgot-password`,
        { email },
      );

      setMessage("Correo de restablecimiento de contraseña enviado.");
      setLoading(false);
    } catch (error) {
      console.error("Error al enviar el correo de restablecimiento:", error);
      setError(
        "Error al enviar el correo de restablecimiento. Inténtalo de nuevo.",
      );
      setLoading(false);
    }
  };

  return (
    <main className="flex h-full w-full flex-col items-center">
      <h2 className="p-10 text-center font-title text-3xl font-bold text-light-buttons dark:text-light-buttons">
        CONTRASEÑA OLVIDADA
      </h2>
      <div
        key={1}
        onMouseMove={(e) => handleMouseMove(e, 1)}
        onMouseEnter={() => handleMouseEnter(1)}
        onMouseLeave={handleMouseLeave}
        className="relative flex h-fit min-w-[90%] overflow-hidden border border-light-text bg-gradient-to-b from-light-background to-light-secondary px-8 py-8 shadow-2xl transition-all duration-500 ease-in-out dark:border-dark-secondary dark:from-dark-background dark:to-dark-secondary md:min-w-fit"
      >
        <input
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-10 h-full w-full cursor-default border-2 border-[#eb5e28]/50 transition-opacity duration-500 placeholder:select-none"
          style={{
            opacity: activeDiv === 1 ? opacity : 0,
            WebkitMaskImage: `radial-gradient(30% 30px at ${position.x}px ${position.y}px, black 45%, transparent)`,
            backgroundColor: "transparent",
          }}
        />
        <div
          className="pointer-events-none absolute -inset-px w-full opacity-0 transition duration-300"
          style={{
            opacity: activeDiv === 1 ? opacity : 0,
            background:
              activeDiv === 1
                ? `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${mode === "dark" ? "rgba(235, 94, 40, 0.1)" : "rgba(200, 80, 35, 0.1)"}, transparent 40%)`
                : "none",
          }}
        />
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col items-center"
        >
          <section className="relative mb-6">
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5">
              <svg
                className="h-4 w-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"
                  stroke="#EB5E28"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <input
              type="text"
              id="user-email"
              required
              className="input-box block w-full border border-light-secondary bg-light-background p-2.5 ps-10 text-sm text-light-text outline-none focus:border-light-highlight focus:ring-light-highlight dark:border-dark-secondary dark:bg-dark-background dark:text-dark-text dark:placeholder-dark-text dark:focus:border-dark-buttons dark:focus:ring-dark-buttons"
              placeholder="Correo electrónico"
              onChange={(e) => setEmail(e.target.value)}
            />
          </section>
          {error && <div className="mb-4 text-red-700">{error}</div>}
          {message && <div className="mb-4 text-green-700">{message}</div>}
          <div className="flex w-fit gap-2">
            <button
              type="submit"
              className="bg-light-buttons px-2 py-1 dark:bg-dark-buttons"
            >
              Enviar correo
            </button>
            <NavLink to="/login">
              <button className="bg-light-secondary px-2 py-1 dark:bg-dark-secondary">
                Volver
              </button>
            </NavLink>
          </div>

          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="relative flex w-full flex-col items-center justify-center gap-4">
                <LoadingSpinner />
              </div>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

export default ForgotPassword;
