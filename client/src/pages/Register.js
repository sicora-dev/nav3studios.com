import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

function Register() {
  const [activeDiv, setActiveDiv] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [mode, setMode] = useState(null);
  const [registering, setRegistering] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/check-auth`,
          {
            withCredentials: true,
          },
        );
        if (response.status === 200) {
          navigate("/");
        }
      } catch (error) {
        console.error("Error al verificar la autenticación:", error);
      }
    };
    checkAuth();
  }, [navigate]);

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
    setRegistering(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/register`,
        {
          username: username,
          email: email,
          password: password,
          password2: password2,
        },
        { withCredentials: true },
      );

      const data = response.data;
      if (data.message === "Registro exitoso") {
        setRegistering(false);
        navigate("/login", {
          state: { fromRegister: true },
        });
      } else {
        setError(
          "Error al iniciar sesión: Token no recibido. Intentalo de nuevo.",
        );
      }
    } catch (error) {
      setRegistering(false);
      console.error("Error al registrarse:", error);
      // Extrae el mensaje de error del objeto de error
      const errorMessage = error.response?.data?.message;
      setError(errorMessage); // Establecer el mensaje de error
    }
  };

  return (
    <main className="flex h-full w-full flex-col items-center">
      <h2 className="p-10 text-center font-title text-3xl font-bold text-light-buttons dark:text-light-buttons">
        REGISTRO
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
          {error && <div className="mb-4 text-red-500">{error}</div>}
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
              type="email"
              id="email"
              required
              className="input-box block w-full border border-light-secondary bg-light-background p-2.5 ps-10 text-sm text-light-text outline-none focus:border-light-highlight focus:ring-light-highlight dark:border-dark-secondary dark:bg-dark-background dark:text-dark-text dark:placeholder-dark-text dark:focus:border-dark-buttons dark:focus:ring-dark-buttons"
              placeholder="Correo electrónico"
              onChange={(e) => setEmail(e.target.value)}
            />
          </section>
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
                  d="M12 14V16M8 9V6C8 3.79086 9.79086 2 12 2C14.2091 2 16 3.79086 16 6V9M7 21H17C18.1046 21 19 20.1046 19 19V11C19 9.89543 18.1046 9 17 9H7C5.89543 9 5 9.89543 5 11V19C5 20.1046 5.89543 21 7 21Z"
                  stroke="#EB5E28"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <input
              type="password"
              id="pasword"
              required
              className="input-box block w-full border border-light-secondary bg-light-background p-2.5 ps-10 text-sm text-light-text outline-none focus:border-light-highlight focus:ring-light-highlight dark:border-dark-secondary dark:bg-dark-background dark:text-dark-text dark:placeholder-dark-text dark:focus:border-dark-buttons dark:focus:ring-dark-buttons"
              placeholder="Contraseña"
              onChange={(e) => setPassword(e.target.value)}
            />
          </section>
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
                  d="M12 14V16M8 9V6C8 3.79086 9.79086 2 12 2C14.2091 2 16 3.79086 16 6V9M7 21H17C18.1046 21 19 20.1046 19 19V11C19 9.89543 18.1046 9 17 9H7C5.89543 9 5 9.89543 5 11V19C5 20.1046 5.89543 21 7 21Z"
                  stroke="#EB5E28"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <input
              type="password"
              id="pasword2"
              required
              className="input-box block w-full border border-light-secondary bg-light-background p-2.5 ps-10 text-sm text-light-text outline-none focus:border-light-highlight focus:ring-light-highlight dark:border-dark-secondary dark:bg-dark-background dark:text-dark-text dark:placeholder-dark-text dark:focus:border-dark-buttons dark:focus:ring-dark-buttons"
              placeholder="Confirmar contraseña"
              onChange={(e) => setPassword2(e.target.value)}
            />
          </section>
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
                  d="M18 18.7083C17.4832 16.375 15.5357 15 12.0001 15C8.46459 15 6.51676 16.375 6 18.7083M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21ZM12 12C13.3333 12 14 11.2857 14 9.5C14 7.71429 13.3333 7 12 7C10.6667 7 10 7.71429 10 9.5C10 11.2857 10.6667 12 12 12Z"
                  stroke="#EB5E28"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <input
              type="text"
              id="username"
              required
              className="input-box block w-full border border-light-secondary bg-light-background p-2.5 ps-10 text-sm text-light-text outline-none focus:border-light-highlight focus:ring-light-highlight dark:border-dark-secondary dark:bg-dark-background dark:text-dark-text dark:placeholder-dark-text dark:focus:border-dark-buttons dark:focus:ring-dark-buttons"
              placeholder="Nombre de usuario"
              onChange={(e) => setUsername(e.target.value)}
            />
          </section>
          <div className="flex w-fit gap-2">
            <button
              type="submit"
              className="bg-light-buttons px-2 py-1 dark:bg-dark-buttons"
            >
              Registrarse
            </button>
            <NavLink to="/login">
              <button className="bg-light-secondary px-2 py-1 dark:bg-dark-secondary">
                Iniciar Sesión
              </button>
            </NavLink>
          </div>
        </form>
        {registering && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <div
              className="relative flex flex-col items-center justify-center gap-4 w-full"
              
            >
              <div class="p-5 text-center absolute">
              <div class="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-dashed border-light-buttons"></div>
              <h2 class="mt-4 text-light-text dark:text-dark-text">
                Cargando...
              </h2>
              <p class="text-zinc-600 w-full dark:text-zinc-400">
                Registando usuario en la base de datos...
              </p>
            </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Register;
