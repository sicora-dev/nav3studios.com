import { React, memo } from "react";

const NavBarAccount = memo(function NavBarAccount({
  activeSection,
  setActiveSection,
}) {
  const handleCheck = (e) => {
    setActiveSection(e.target.id);
  };

  return (
    <div class="relative flex w-auto items-center justify-center transition-all duration-[450ms] ease-in-out">
      <article class="relative left-0 flex w-fit gap-2 border border-solid border-light-text bg-light-secondary shadow-lg shadow-black/15 duration-500 ease-in-out dark:bg-dark-secondary">
        <div
          className={`absolute h-12 w-1/2 border border-light-buttons transition-transform duration-300 ease-in-out ${
            activeSection === "settings" ? "translate-x-full" : "translate-x-0"
          }`}
        />
        <label
          class={`min-w-50 group relative flex h-12 w-full flex-row items-center justify-center gap-3 border-solid border-light-background/10 px-10 text-light-text duration-300 ease-in-out dark:border-dark-background/30 dark:text-dark-text lg:px-20`}
          for="bookings"
        >
          <input
            id="bookings"
            name="path"
            type="radio"
            class="peer/expand hidden"
            onClick={handleCheck}
          />
          <svg
            viewBox="0 0 24 24"
            height="24"
            width="24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class={`text-2xl duration-300 ease-in-out ${
              activeSection === "bookings"
                ? "scale-125 stroke-light-buttons text-light-buttons"
                : ""
            } stroke-light-text peer-hover/expand:scale-125 peer-hover/expand:stroke-light-buttons peer-hover/expand:text-light-buttons dark:stroke-dark-text`}
          >
            <path
              d="M20 9H4M7 3V5M17 3V5M6 21H18C19.1046 21 20 20.1046 20 19V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p
            className={`hidden font-title font-bold duration-300 ease-in-out sm:block`}
          >
            Reservas
          </p>
        </label>
        <label
          class={`min-w-50 group relative flex h-12 w-full flex-row items-center justify-center gap-3 border-solid border-light-background/10 px-10 text-light-text duration-300 ease-in-out dark:border-dark-background/30 dark:text-dark-text lg:px-20`}
          for="settings"
        >
          <input
            id="settings"
            name="path"
            type="radio"
            class="peer/expand hidden"
            onClick={handleCheck}
          />
          <svg
            viewBox="0 0 24 24"
            height="24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            class={`text-2xl duration-300 ease-in-out ${
              activeSection === "settings"
                ? "scale-125 fill-light-buttons text-light-buttons"
                : ""
            } fill-light-text peer-checked/expand:fill-dark-buttons peer-hover/expand:scale-125 peer-hover/expand:fill-light-buttons peer-hover/expand:text-light-buttons dark:fill-dark-text`}
          >
            <path d="M12 16c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0-6c1.084 0 2 .916 2 2s-.916 2-2 2-2-.916-2-2 .916-2 2-2z"></path>
            <path d="m2.845 16.136 1 1.73c.531.917 1.809 1.261 2.73.73l.529-.306A8.1 8.1 0 0 0 9 19.402V20c0 1.103.897 2 2 2h2c1.103 0 2-.897 2-2v-.598a8.132 8.132 0 0 0 1.896-1.111l.529.306c.923.53 2.198.188 2.731-.731l.999-1.729a2.001 2.001 0 0 0-.731-2.732l-.505-.292a7.718 7.718 0 0 0 0-2.224l.505-.292a2.002 2.002 0 0 0 .731-2.732l-.999-1.729c-.531-.92-1.808-1.265-2.731-.732l-.529.306A8.1 8.1 0 0 0 15 4.598V4c0-1.103-.897-2-2-2h-2c-1.103 0-2 .897-2 2v.598a8.132 8.132 0 0 0-1.896 1.111l-.529-.306c-.924-.531-2.2-.187-2.731.732l-.999 1.729a2.001 2.001 0 0 0 .731 2.732l.505.292a7.683 7.683 0 0 0 0 2.223l-.505.292a2.003 2.003 0 0 0-.731 2.733zm3.326-2.758A5.703 5.703 0 0 1 6 12c0-.462.058-.926.17-1.378a.999.999 0 0 0-.47-1.108l-1.123-.65.998-1.729 1.145.662a.997.997 0 0 0 1.188-.142 6.071 6.071 0 0 1 2.384-1.399A1 1 0 0 0 11 5.3V4h2v1.3a1 1 0 0 0 .708.956 6.083 6.083 0 0 1 2.384 1.399.999.999 0 0 0 1.188.142l1.144-.661 1 1.729-1.124.649a1 1 0 0 0-.47 1.108c.112.452.17.916.17 1.378 0 .461-.058.925-.171 1.378a1 1 0 0 0 .471 1.108l1.123.649-.998 1.729-1.145-.661a.996.996 0 0 0-1.188.142 6.071 6.071 0 0 1-2.384 1.399A1 1 0 0 0 13 18.7l.002 1.3H11v-1.3a1 1 0 0 0-.708-.956 6.083 6.083 0 0 1-2.384-1.399.992.992 0 0 0-1.188-.141l-1.144.662-1-1.729 1.124-.651a1 1 0 0 0 .471-1.108z"></path>
          </svg>
          <p
            className={`hidden font-title font-bold duration-300 ease-in-out sm:block`}
          >
            Ajustes
          </p>
        </label>
      </article>
    </div>
  );
});

export default NavBarAccount;
