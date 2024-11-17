import React from "react";
import Services from "../components/Services";
import { NavLink } from "react-router-dom";
import "../styles/home.css";

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
              <button className="peer z-10 -translate-x-1 -translate-y-1 bg-light-buttons px-2 transition ease-in-out active:-translate-x-0 active:translate-y-0 active:text-light-highlight md:hover:dark:text-dark-highlight dark:active:text-dark-highlight md:text-light-text md:hover:-translate-x-0 md:hover:translate-y-0 md:hover:text-light-highlight md:dark:text-dark-text md:dark:hover:text-dark-highlight">
                Reserva
              </button>
              <div className="absolute h-full w-full bg-light-highlight transition-opacity ease-in-out peer-active:opacity-0 dark:bg-dark-highlight md:peer-hover:opacity-0"></div>
            </div>
          </NavLink>
          <NavLink to="/information">
            <button className="bg-light-secondary px-2 shadow-[0_0.5em_0.5em_-0.4em_#EB5E28] transition ease-in-out md:hover:text-light-highlight md:hover:shadow-[0_0.5em_0.5em_-0.4em_#EB5E28] active:translate-y-1 active:shadow-none dark:bg-dark-secondary active:dark:text-dark-highlight active:text-light-highlight md:dark:hover:text-dark-highlight md:shadow-none md:hover:-translate-y-1">
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
