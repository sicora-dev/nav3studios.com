import React, { useState, useEffect, memo } from "react";


const Services = memo(function Services() {
  const [activeDiv, setActiveDiv] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [mode, setMode] = useState(null);

  const handleMouseMove = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = (id) => {
    setActiveDiv(id);
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setActiveDiv(null);
    setOpacity(0);
  };

  useEffect(() => {
    const isDarkMode = localStorage.getItem("isDarkMode") === "true";
    setMode(isDarkMode ? "dark" : "light");
  });

  return (
    <main className="flex flex-col items-center justify-center pl-5 pr-5">
      <h2 className="p-10 text-center font-title text-3xl font-bold text-light-highlight dark:text-dark-highlight">
        NUESTROS SERVICIOS
      </h2>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {[1, 2, 3, 4].map((id) => (
          <div
            key={id}
            onMouseMove={(e) => handleMouseMove(e, id)}
            onMouseEnter={() => handleMouseEnter(id)}
            onMouseLeave={handleMouseLeave}
            className="relative max-w-md overflow-hidden border border-light-text bg-gradient-to-r from-light-background to-light-secondary px-8 py-16 shadow-2xl dark:border-dark-secondary dark:from-dark-background dark:to-dark-secondary"
          >
            <input
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 z-10 h-full w-full cursor-default border-2 border-[#eb5e28]/50 transition-opacity duration-500 placeholder:select-none"
              style={{
                opacity: activeDiv === id ? opacity : 0,
                WebkitMaskImage: `radial-gradient(30% 30px at ${position.x}px ${position.y}px, black 45%, transparent)`,
                backgroundColor: "transparent",
              }}
            />
            <div
              className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
              style={{
                opacity: activeDiv === id ? opacity : 0,
                background:
                  activeDiv === id
                    ? `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${mode === "dark" ? "rgba(235, 94, 40, 0.1)" : "rgba(200, 80, 35, 0.1)"}, transparent 40%)`
                    : "none",
              }}
            />
            <div className="relative">
              {id === 1 && (
                <div>
                  <h3 className="text-xl font-bold text-light-buttons dark:text-light-buttons">
                    Grabación
                  </h3>
                  <p className="text-light-text dark:text-dark-text">
                    Graba tus canciones de la mano de
                    <span className="font-bold text-light-highlight dark:text-dark-highlight">
                      {" "}
                      los mejores productores locales.
                    </span>
                  </p>
                </div>
              )}
              {id === 2 && (
                <div>
                  <h3 className="text-xl font-bold text-light-buttons dark:text-light-buttons">
                    Mezcla y Máster
                  </h3>
                  <p className="text-light-text dark:text-dark-text">
                    Mezcla y masteriza tus canciones. No necesariamente tienen
                    que haberse grabado con nosotros.
                    <span className="font-bold text-light-highlight dark:text-dark-highlight">
                      {" "}
                      No somos celosos.
                    </span>
                  </p>
                </div>
              )}
              {id === 3 && (
                <div>
                  <h3 className="text-xl font-bold text-light-buttons dark:text-light-buttons">
                    Beat
                  </h3>
                  <p className="text-light-text dark:text-dark-text">
                    Deja que Roux se encargue de hacer tus melodías realidad.
                    <span className="font-bold text-light-highlight dark:text-dark-highlight">
                      {" "}
                      !Let him cook¡
                    </span>
                  </p>
                </div>
              )}
              {id === 4 && (
                <div>
                  <h3 className="text-xl font-bold text-light-buttons dark:text-light-buttons">
                    Sesión completa
                  </h3>
                  <p className="text-light-text dark:text-dark-text">
                    <span className="font-bold text-light-highlight dark:text-dark-highlight">
                      ¿Quieres un completo?{" "}
                    </span>
                    Ven a Nav3 y nosotros nos encargamos del resto. Grabación,
                    mezcla y máster, todo aquí.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
})

export default Services;
