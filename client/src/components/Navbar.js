import "../styles/index.css";
import "../styles/navbar.css";
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import Hamburger from "hamburger-react";


function Navbar() {
  const [isClosed, setClosed] = useState(true);
  const [loged, setLoged] = useState(false);

  const toogleMenu = () => {
    if (window.innerWidth < 768) setClosed(!isClosed);
  };

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
        if (response.status !== 200) {
          throw new Error("Not authenticated");
        } else {
          setLoged(true);
        }
      } catch (error) {
        setLoged(false);
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <>
      <div className="absolute z-50 md:hidden text-light-buttons">
        <Hamburger toggled={!isClosed} onToggle={toogleMenu} />
      </div>

      <nav
        className={`${isClosed ? "-translate-x-[100%] md:translate-x-0" : ""} absolute z-40 min-h-full w-80 min-w-fit content-center bg-light-secondary p-4 pl-10 transition ease-in-out dark:bg-dark-secondary md:visible md:fixed md:z-0 md:col-span-1`}
      >
        <ul className="flex h-96 flex-col justify-around space-y-5 text-2xl">
          <li className="w-fit">
            <NavLink to="/">
              <button
                className="dark:bg-dark-button flex items-center rounded p-2 font-title font-bold text-light-text transition ease-in-out hover:translate-x-2 hover:text-light-buttons dark:text-dark-text dark:hover:text-dark-buttons"
                onClick={toogleMenu}
              >
                <img
                  src="/assets/icono_rombo.svg"
                  alt="Rombo Icon"
                  className="icon-rotate mr-2 inline-block h-4 w-4"
                />
                INICIO
              </button>
            </NavLink>
          </li>

          <li className="w-fit">
            <NavLink to="/information">
              <button
                className="dark:bg-dark-button flex items-center rounded p-2 font-title font-bold text-light-text transition ease-in-out hover:translate-x-2 hover:text-light-buttons dark:text-dark-text dark:hover:text-dark-buttons"
                onClick={toogleMenu}
              >
                <img
                  src="/assets/icono_rombo.svg"
                  alt="Rombo Icon"
                  className="icon-rotate mr-2 inline-block h-4 w-4"
                />
                INFORMACIÓN
              </button>
            </NavLink>
          </li>
          <li className="w-fit">
            <NavLink to="/reserva">
              <button
                className="dark:bg-dark-button flex items-center rounded p-2 font-title font-bold text-light-text transition ease-in-out hover:translate-x-2 hover:text-light-buttons dark:text-dark-text dark:hover:text-dark-buttons"
                onClick={toogleMenu}
              >
                <img
                  src="/assets/icono_rombo.svg"
                  alt="Rombo Icon"
                  className="icon-rotate mr-2 inline-block h-4 w-4"
                />
                RESERVA
              </button>
            </NavLink>
          </li>
          {!loged && (
            <li id="login" className="w-fit">
              <NavLink to="/login">
                <button
                  className="dark:bg-dark-button flex items-center rounded p-2 font-title font-bold text-light-text transition ease-in-out hover:translate-x-2 hover:text-light-buttons dark:text-dark-text dark:hover:text-dark-buttons"
                  onClick={toogleMenu}
                >
                  <img
                    src="/assets/icono_rombo.svg"
                    alt="Rombo Icon"
                    className="icon-rotate mr-2 inline-block h-4 w-4"
                  />
                  INICIAR SESIÓN
                </button>
              </NavLink>
            </li>
          )}
          {loged && (
            <li id="login" className="w-fit">
              <NavLink to="/account">
                <button
                  className="dark:bg-dark-button flex items-center rounded p-2 font-title font-bold text-light-text transition ease-in-out hover:translate-x-2 hover:text-light-buttons dark:text-dark-text dark:hover:text-dark-buttons"
                  onClick={toogleMenu}
                >
                  <img
                    src="/assets/icono_rombo.svg"
                    alt="Rombo Icon"
                    className="icon-rotate mr-2 inline-block h-4 w-4"
                  />
                  MI CUENTA
                </button>
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
}

export default Navbar;
