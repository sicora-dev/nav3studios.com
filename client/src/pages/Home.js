import React, { lazy } from "react";
import { NavLink } from "react-router-dom";
import "../styles/home.css";

const Services = lazy(() => import("../components/Services"));

function Home() {
  return (
    <main className="flex h-screen w-full flex-col items-center bg-light-background p-5 dark:bg-dark-background">
      <div className="container flex h-1/2 w-fit justify-center p-5 font-title font-bold sm:p-0">
        <div className="ml-5 text-left font-body sm:ml-0">Studios</div>
        <div
          className="stack text-[5rem] text-light-buttons md:text-[7rem]"
          style={{ "--stacks": 3 }}
        >
          <span className="text-center" style={{ "--index": 0 }}>
            NAV3
          </span>
          <span className="text-center" style={{ "--index": 1 }}>
            NAV3
          </span>
          <span className="text-center" style={{ "--index": 2 }}>
            NAV3
          </span>
        </div>
        <div className="mr-5 text-right font-body sm:mr-0">Madrid</div>
        <section className="mt-5 flex w-full flex-col items-center justify-around gap-5 sm:flex-row">
          <NavLink to="/reserva">
            <div className="relative flex">
              <button className="peer z-10 -translate-x-1 -translate-y-1 rounded-md bg-light-buttons px-2 transition ease-in-out active:-translate-x-0 active:translate-y-0 active:text-light-highlight md:text-light-text md:hover:-translate-x-0 md:hover:translate-y-0 md:hover:text-light-highlight dark:active:text-dark-highlight md:dark:text-dark-text md:dark:hover:text-dark-highlight md:hover:dark:text-dark-highlight">
                Reserva
              </button>
              <div className="absolute h-full w-full rounded-md bg-light-highlight transition-opacity ease-in-out peer-active:opacity-0 md:peer-hover:opacity-0 dark:bg-dark-highlight"></div>
            </div>
          </NavLink>
          <NavLink to="/information">
            <button className="rounded-md bg-light-secondary px-2 shadow-[0_0.5em_0.5em_-0.4em_#EB5E28] transition ease-in-out active:translate-y-1 active:text-light-highlight active:shadow-none md:shadow-none md:hover:-translate-y-1 md:hover:text-light-highlight md:hover:shadow-[0_0.5em_0.5em_-0.4em_#EB5E28] dark:bg-dark-secondary active:dark:text-dark-highlight md:dark:hover:text-dark-highlight">
              Conócenos
            </button>
          </NavLink>
        </section>
      </div>

      <Services />
    </main>
  );
}

export default Home;
