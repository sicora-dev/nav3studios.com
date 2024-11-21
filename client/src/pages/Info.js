import Map from "../components/Map";
import LazyLoadLocal from "../components/LazyLoadLocal";
import "../styles/info.css";
import React, { useState, useEffect } from "react";

function Info() {
  const [activeDiv, setActiveDiv] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [mode, setMode] = useState(null);

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

  useEffect(() => {
    const isDarkMode = localStorage.getItem("isDarkMode") === "true";
    setMode(isDarkMode ? "dark" : "light");
  });

  return (
    <main className="flex w-full flex-col items-center p-5">
      <h2 className="p-10 text-center font-title text-3xl font-bold text-light-buttons dark:text-light-buttons">
        ¿DÓNDE ESTAMOS?
      </h2>
      <Map />

      <div className="mt-10 flex h-fit w-full hb- flex-col">
        <h2 className="p-10 text-center font-title text-3xl font-bold text-light-buttons dark:text-light-buttons">
          NUESTROS PRODUCTORES
        </h2>
        <div className="m-auto  grid grid-cols-1 gap-10 pb-20 xl:grid-cols-2">
          {[1, 2].map((id) => (
            <div
              key={id}
              onMouseMove={(e) => handleMouseMove(e, id)}
              onMouseEnter={() => handleMouseEnter(id)}
              onMouseLeave={handleMouseLeave}
              className="relative flex h-full max-w-md overflow-hidden border border-light-text bg-gradient-to-b from-light-background to-light-secondary px-8 py-8 shadow-2xl transition-all duration-500 ease-in-out hover:max-h-[1200px] dark:border-dark-secondary dark:from-dark-background dark:to-dark-secondary xl:max-h-[460px]"
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

              {id === 1 && (
                <article className="relative flex flex-col content-center items-center gap-2">
                  <img
                    src="assets/foto_najera_recortada_gradient.webp"
                    className="card h-auto max-h-96 w-auto transform bg-light-buttons"
                    alt="imagen najera"
                  />
                  <h3 className="text-lig font-title text-2xl font-bold text-light-highlight dark:text-dark-highlight">
                    Najerax
                  </h3>
                  <p className="w-full">
                    Javier Nájera,{" "}
                    <span className="text-light-buttons">Nájerax (NJX)</span>,
                    es un artista y productor español que con tan solo 8 años,
                    comenzó aprendiendo y tocando el piano hasta los 16, que
                    comenzaría en el mundo de la música como{" "}
                    <span className="text-light-buttons">
                      cantante y productor
                    </span>
                    . Actualmente dispone de una amplia variedad en su
                    discografía, lanzo su último álbum en Febrero de 2023
                    llamado @A Mi Manera, pero lo más destacado hasta ahora es{" "}
                    <span className="text-light-buttons">
                      su participación en @ FIESTA BRESH 2024 🌸
                    </span>{" "}
                    con su último single Contigo{" "}
                    <span className="text-light-buttons">
                      sonando en fiestas por todo
                    </span>{" "}
                    el mundo como en Londres y Buenos Aires.
                  </p>
                </article>
              )}
              {id === 2 && (
                <article className="relative flex flex-col items-center gap-2">
                  <img
                    src="assets/roux_foto_estudio_gradient.webp"
                    className={`card h-auto max-h-96 w-auto bg-light-buttons`}
                    alt="imagen roux"
                  />
                  <h3 className="font-title text-2xl font-bold text-light-highlight dark:text-dark-highlight">
                    Roux
                  </h3>
                  <p className="w-full">
                    Deja que Roux sea quien{" "}
                    <span className="text-light-buttons"> de vida</span> a esas
                    melodías que no puedes sacarte de la cabeza , esas que
                    tarareas una y otra vez sin darte cuenta, o permítele
                    convertir en realidad esa canción con la que sueñas , esa
                    que imaginas sonando en la radio y llegando a miles de
                    personas. Este talentoso joven, con una{" "}
                    <span className="text-light-buttons">
                      amplia y sólida experiencia
                    </span>{" "}
                    en la industria musical , está aquí para hacer que esos
                    sueños se materialicen. Con su{" "}
                    <span className="text-light-buttons">
                      creatividad, pasión y dominio del oficio
                    </span>
                    , Roux hará que tu visión se convierta en una obra única y
                    profesional, elevando tu música al{" "}
                    <span className="text-light-buttons">siguiente nivel</span>.
                  </p>
                </article>
              )}
            </div>
          ))}
        </div>
      </div>
      <h2 className="p-10 text-center font-title text-3xl font-bold text-light-buttons dark:text-light-buttons">
        GALERIA DE IMÁGENES
      </h2>
      <LazyLoadLocal />
    </main>
  );
}

export default Info;
