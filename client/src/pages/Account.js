import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavBarAccount from "../components/NavBarAccount";
import ChangeUser from "../components/ChangeUser";
import Bookings from "../components/Bookings";

const Account = () => {
  const [activeDiv, setActiveDiv] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [mode, setMode] = useState(null);
  const [activeButton, setActiveButton] = useState(null);
  const [activeSection, setActiveSection] = useState("bookings");
  const [isLoading, setIsLoading] = useState(true);
  const [showWantsLogout, setShowWantsLogout] = useState(false);
  const [settingsOption, setSettingsOption] = useState(null);
  const [bookingOption, setBookingOption] = useState("active");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [userBookings, setUserBookings] = useState([]);
  const [producerBookings, setProducerBookings] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [producer, setProducer] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/check-auth`,
          {
            withCredentials: true,
          },
        );
        if (response.status !== 200) {
          throw new Error("Not authenticated");
        }
      } catch (error) {
        navigate("/login", { state: { fromAccount: true } });
        setError("Debes iniciar sesión");
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/user-token`,
          {
            withCredentials: true,
          },
        );
        const user = response.data;
        setUsername(user.username);
        setEmail(user.email);
        setUserId(user.id);
        if (parseInt(user.role_id) === 2) {
          setAdmin(false);
          setProducer(true);
          fetchProducerBookings(user.id);
        }
        if (parseInt(user.role_id) === 3) {
          setProducer(false);
          setAdmin(true);
          fetchAdminBookings();
        }
        if (parseInt(user.role_id) === 1) {
          setProducer(false);
          setAdmin(false);
          fetchUserBookings(user.id);
        }
      } catch (error) {
        setError("Error al obtener el usuario");
      }
    };
    const fetchUserBookings = async (userId) => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/bookings/user`,
          {
            withCredentials: true,
            params: { userId: userId },
          },
        );
        setUserBookings(response.data); // Sin formatear
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user bookings:", error);
        setUserBookings([]);
      }
    };
    const fetchProducerBookings = async (userId) => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/bookings/producer`,
          {
            withCredentials: true,
            params: { producerId: userId },
          },
        );
        setProducerBookings(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al obtener las reservas:", error);
      }
    };

    const fetchAdminBookings = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/bookings`,
          {
            withCredentials: true,
          },
        );
        setAdminBookings(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al obtener las reservas:", error);
      }
    };
    fetchUser();
  }, [userId]);

  useEffect(() => {
    const bg = document.getElementById("bg-buttons");
    const button = document.getElementById(activeButton);

    if (button) {
      const width = button.offsetWidth;
      bg.style.width = `${width}px`;
      if (activeButton === "reservas") {
        bg.style.left = "0";
        bg.right = "auto";
      } else {
        bg.style.left = "auto";
        bg.style.right = "0";
      }
    }
  }, [activeButton]);

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

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/logout`,
        {},
        {
          withCredentials: true,
        },
      );

      if (response.status === 200) {
        setUsername("");
        setEmail("");
        setUserId("");
        setProducer(false);
        setAdmin(false);
        navigate("/login");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <main className="flex h-full w-full flex-col items-center">
      <h2 className="p-10 text-center font-title text-3xl font-bold text-light-buttons dark:text-light-buttons">
        HOLA {username.toUpperCase().substring(0, 20)}
      </h2>
      <div
        key={1}
        onMouseMove={(e) => handleMouseMove(e, 1)}
        onMouseEnter={() => handleMouseEnter(1)}
        onMouseLeave={handleMouseLeave}
        className="relative mx-10 flex max-h-[2000px] min-w-[90%] justify-center overflow-hidden border border-light-text bg-gradient-to-b from-light-background to-light-secondary px-8 py-8 shadow-2xl transition-all duration-500 ease-in-out dark:border-dark-secondary dark:from-dark-background dark:to-dark-secondary md:min-w-fit"
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
        <div className="flex flex-col items-center gap-5">
          <section className="w-full">
            <NavBarAccount
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </section>

          {isLoading && (
            <div class="p-5 text-center">
              <div class="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-dashed border-light-buttons"></div>
              <h2 class="mt-4 text-light-text dark:text-dark-text">
                Cargando...
              </h2>
              <p class="text-zinc-600 dark:text-zinc-400">
                Cargando tus reservas...
              </p>
            </div>
          )}
          {activeSection === "bookings" && (
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:items-center sm:gap-2">
              <button
                className={`flex w-full items-center gap-2 bg-light-secondary px-2 py-1 transition ease-in-out dark:bg-dark-secondary ${
                  bookingOption === "active"
                    ? "-translate-y-1 shadow-[0_0.5em_0.5em_-0.4em_#EB5E28]"
                    : "-translate-y-1 active:-translate-y-0 active:shadow-none sm:translate-y-0 sm:shadow-none sm:hover:-translate-y-1 sm:hover:shadow-[0_0.5em_0.5em_-0.4em_#EB5E28]"
                }`}
                onClick={() => setBookingOption("active")}
              >
                <svg
                  className="h-4 w-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                    stroke="#EB5E28"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M10.4706 8.78431C9.80448 8.42906 9 8.91175 9 9.66667V14.3333C9 15.0883 9.80448 15.5709 10.4706 15.2157L15.6728 12.4412C16.0257 12.2529 16.0257 11.7471 15.6728 11.5588L10.4706 8.78431Z"
                    stroke="#EB5E28"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>Activas</span>
              </button>

              <button
                className={`flex w-full items-center gap-2 bg-light-secondary px-2 py-1 transition ease-in-out dark:bg-dark-secondary ${
                  bookingOption === "pending"
                    ? "-translate-y-1 shadow-[0_0.5em_0.5em_-0.4em_#EB5E28]"
                    : "-translate-y-1 active:-translate-y-0 active:shadow-none sm:translate-y-0 sm:shadow-none sm:hover:-translate-y-1 sm:hover:shadow-[0_0.5em_0.5em_-0.4em_#EB5E28]"
                }`}
                onClick={() => setBookingOption("pending")}
              >
                <svg
                  className="h-4 w-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M16 14L12 12V7M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                    stroke="#EB5E28"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>Pendientes</span>
              </button>

              <button
                className={`flex w-full items-center gap-2 bg-light-secondary px-2 py-1 transition ease-in-out dark:bg-dark-secondary ${
                  bookingOption === "history"
                    ? "-translate-y-1 shadow-[0_0.5em_0.5em_-0.4em_#EB5E28]"
                    : "-translate-y-1 active:-translate-y-0 active:shadow-none sm:translate-y-0 sm:shadow-none sm:hover:-translate-y-1 sm:hover:shadow-[0_0.5em_0.5em_-0.4em_#EB5E28]"
                }`}
                onClick={() => setBookingOption("history")}
              >
                <svg
                  className="h-4 w-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3.0156 10H6.99999M3.0156 10V6M3.0156 10L6.34315 6.34315C9.46734 3.21895 14.5327 3.21895 17.6569 6.34315C20.781 9.46734 20.781 14.5327 17.6569 17.6569C14.5327 20.781 9.46734 20.781 6.34315 17.6569C5.55928 16.873 4.97209 15.9669 4.58158 15M12 9V13L15 14.5"
                    stroke="#EB5E28"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>Pasadas</span>
              </button>

              <button
                className={`flex w-full items-center gap-2 bg-light-secondary px-2 py-1 transition ease-in-out dark:bg-dark-secondary ${
                  bookingOption === "canceled"
                    ? "-translate-y-1 shadow-[0_0.5em_0.5em_-0.4em_#EB5E28]"
                    : "-translate-y-1 active:-translate-y-0 active:shadow-none sm:translate-y-0 sm:shadow-none sm:hover:-translate-y-1 sm:hover:shadow-[0_0.5em_0.5em_-0.4em_#EB5E28]"
                }`}
                onClick={() => setBookingOption("canceled")}
              >
                <svg
                  className="h-4 w-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M18.364 5.63604C19.9926 7.26472 21 9.51472 21 12C21 16.9706 16.9706 21 12 21C9.51472 21 7.26472 19.9926 5.63604 18.364M18.364 5.63604C16.7353 4.00736 14.4853 3 12 3C7.02944 3 3 7.02944 3 12C3 14.4853 4.00736 16.7353 5.63604 18.364M18.364 5.63604L5.63604 18.364"
                    stroke="#EB5E28"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>Canceladas</span>
              </button>
            </div>
          )}
          {activeSection === "bookings" && !admin && !producer && (
            <Bookings
              bookingOption={bookingOption}
              bookings={userBookings}
              producer={false}
            />
          )}

          {activeSection === "bookings" && producer && (
            <Bookings
              bookingOption={bookingOption}
              bookings={producerBookings}
              producer={true}
            />
          )}

          {activeSection === "bookings" && admin && (
            <Bookings
              bookingOption={bookingOption}
              bookings={adminBookings}
              producer={true}
            />
          )}

          {activeSection === "settings" && (
            <div className="flex flex-col items-center gap-2">
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
                <button
                  className={`flex w-full items-center gap-2 bg-light-secondary px-2 py-1 transition ease-in-out dark:bg-dark-secondary ${
                    settingsOption === "username"
                      ? "-translate-y-1 shadow-[0_0.5em_0.5em_-0.4em_#EB5E28]"
                      : "-translate-y-1 active:-translate-y-0 active:shadow-none sm:translate-y-0 sm:shadow-none sm:hover:-translate-y-1 sm:hover:shadow-[0_0.5em_0.5em_-0.4em_#EB5E28]"
                  }`}
                  onClick={() => setSettingsOption("username")}
                >
                  <svg
                    className="h-4 w-4"
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
                  <span>Usuario</span>
                </button>

                <button
                  className={`flex w-full items-center gap-2 bg-light-secondary px-2 py-1 transition ease-in-out dark:bg-dark-secondary ${
                    settingsOption === "email"
                      ? "-translate-y-1 shadow-[0_0.5em_0.5em_-0.4em_#EB5E28]"
                      : "-translate-y-1 active:-translate-y-0 active:shadow-none sm:translate-y-0 sm:shadow-none sm:hover:-translate-y-1 sm:hover:shadow-[0_0.5em_0.5em_-0.4em_#EB5E28]"
                  }`}
                  onClick={() => setSettingsOption("email")}
                >
                  <svg
                    className="h-4 w-4"
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
                  <span>Email</span>
                </button>
                <div className="col-span-2 flex w-full justify-center">
                  <button
                    className={`flex w-fit items-center gap-2 bg-light-secondary px-2 py-1 transition ease-in-out dark:bg-dark-secondary ${
                      settingsOption === "password"
                        ? "-translate-y-1 shadow-[0_0.5em_0.5em_-0.4em_#EB5E28]"
                        : "-translate-y-1 active:-translate-y-0 active:shadow-none sm:translate-y-0 sm:shadow-none sm:hover:-translate-y-1 sm:hover:shadow-[0_0.5em_0.5em_-0.4em_#EB5E28]"
                    }`}
                    onClick={() => setSettingsOption("password")}
                  >
                    <svg
                      className="h-4 w-4"
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
                    <span>Contraseña</span>
                  </button>
                </div>
              </div>

              <ChangeUser
                settingsOption={settingsOption}
                userId={userId}
                onUpdateSuccess={(message) => {
                  // Handle success message here
                  setMessage(message);
                }}
              />
            </div>
          )}
        </div>
        <button
          className="absolute bottom-3 right-3 transition ease-in-out hover:scale-110 active:scale-100"
          onClick={() => setShowWantsLogout(true)}
        >
          <svg
            className="h-6 w-6"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M14 20H6C4.89543 20 4 19.1046 4 18L4 6C4 4.89543 4.89543 4 6 4H14M10 12H21M21 12L18 15M21 12L18 9"
              stroke="#EB5E28"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        {showWantsLogout && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowWantsLogout(false)}
          >
            <div
              className="relative flex flex-col items-center gap-4 bg-light-secondary p-5 dark:bg-dark-secondary"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="font-title text-xl font-bold">
                ¿Quieres cerrar tu sesión?
              </h4>
              <p>Podrás volver a iniciarla en Inicio de Sesión</p>
              <div className="flex gap-4">
                <button
                  className="bg-light-buttons px-4 py-2"
                  onClick={() => setShowWantsLogout(false)}
                >
                  Mantener sesión
                </button>
                <button
                  className="bg-light-highlight px-4 py-2 dark:bg-dark-highlight"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
export default Account;
