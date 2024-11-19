import { React, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/reset-password/${token}`,
        { password }
      );

      setMessage("Contraseña restablecida correctamente.");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      setError("Error al restablecer la contraseña. Inténtalo de nuevo.");
    }
  };

  return (
    <main className="flex h-full w-full flex-col items-center">
      <h2 className="p-10 text-center font-title text-3xl font-bold text-light-buttons dark:text-light-buttons">
        RESTABLECER CONTRASEÑA
      </h2>
      <div
        key={1}
        className="relative flex h-fit min-w-[90%] overflow-hidden border border-light-text bg-gradient-to-b from-light-background to-light-secondary px-8 py-8 shadow-2xl transition-all duration-500 ease-in-out dark:border-dark-secondary dark:from-dark-background dark:to-dark-secondary md:min-w-fit"
      >
        <form onSubmit={handleSubmit} className="flex w-full flex-col items-center">
          <section className="relative mb-6">
            <input
              type="password"
              id="new-password"
              required
              className="input-box block w-full border border-light-secondary bg-light-background p-2.5 text-sm text-light-text outline-none focus:border-light-highlight focus:ring-light-highlight dark:border-dark-secondary dark:bg-dark-background dark:text-dark-text dark:placeholder-dark-text dark:focus:border-dark-buttons dark:focus:ring-dark-buttons"
              placeholder="Nueva contraseña"
              onChange={(e) => setPassword(e.target.value)}
            />
          </section>
          <section className="relative mb-6">
            <input
              type="password"
              id="confirm-password"
              required
              className="input-box block w-full border border-light-secondary bg-light-background p-2.5 text-sm text-light-text outline-none focus:border-light-highlight focus:ring-light-highlight dark:border-dark-secondary dark:bg-dark-background dark:text-dark-text dark:placeholder-dark-text dark:focus:border-dark-buttons dark:focus:ring-dark-buttons"
              placeholder="Confirmar nueva contraseña"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </section>
          {error && <div className="mb-4 text-red-500">{error}</div>}
          {message && <div className="mb-4 text-green-500">{message}</div>}
          <div className="flex w-fit gap-2">
            <button
              type="submit"
              className="bg-light-buttons px-2 py-1 dark:bg-dark-buttons"
            >
              Restablecer contraseña
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ResetPassword;