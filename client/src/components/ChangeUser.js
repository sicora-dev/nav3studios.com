import { React, useEffect, useState } from "react";
import axios from "axios";
import Typewriter from "typewriter-effect";

function ChangeUser({ settingsOption, userId }) {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [musicFacts, setMusicFacts] = useState([
    "El primer disco de reggaetón comercial fue 'Playero 37' lanzado en 1994",
    "Michael Jackson tiene el álbum más vendido de la historia con 'Thriller'",
    "Bad Bunny fue el artista más escuchado globalmente en Spotify en 2020, 2021 y 2022",
    "El término 'pop music' apareció por primera vez en 1926",
    "Daddy Yankee comenzó su carrera artística a los 13 años",
    "La canción 'Despacito' fue la primera en español en alcanzar el #1 del Billboard Hot 100 desde 'Macarena'",
    "Lady Gaga puede tocar el piano desde los 4 años de edad",
    "El K-pop moderno comenzó con el grupo Seo Taiji and Boys en 1992",
    "Drake es el artista con más entradas al Billboard Hot 100 en la historia",
    "El reggaetón tiene sus orígenes en el reggae en español de Panamá",
    "BTS es el primer grupo de K-pop en alcanzar el #1 en el Billboard Hot 100",
    "Eminem tiene el álbum de rap más vendido de la historia con 'The Marshall Mathers LP'",
    "La primera canción de rap comercialmente exitosa fue 'Rapper's Delight' de The Sugarhill Gang",
    "Taylor Swift es la artista con más álbumes #1 simultáneos en Billboard",
    "El término 'urbano' en música comenzó a usarse en los años 70 para describir la música R&B",
    "Ed Sheeran escribió 'Love Yourself' originalmente para Rihanna, no Justin Bieber",
    "Bad Bunny comenzó como empacador en un supermercado mientras estudiaba en la universidad",
    "El primer video musical transmitido en MTV fue 'Video Killed the Radio Star'",
    "Shakira comenzó a escribir canciones a los 8 años",
    "La primera transmisión de radio comercial de música fue en 1920",
    "¿Sabias que la canción 'Contigo' de Najerax (uno de nuestros productores), sonó en la fiesta Bresh en Londrés?",
  ]);

  const updateUsername = async (userId, newUsername) => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/update-username`,
        {
          userId: userId,
          newUsername: newUsername,
        },
        {
          withCredentials: true,
        },
      );
      handleUpdateSuccess(response.data.message);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Error al actualizar el nombre de usuario",
      );
    }
  };

  const updateEmail = async (userId, newEmail) => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/update-email`,
        {
          userId: userId,
          newEmail: newEmail,
        },
        {
          withCredentials: true,
        },
      );

      handleUpdateSuccess(response.data.message);
    } catch (error) {
      setError(error.response?.data?.message || "Error al actualizar el email");
    }
  };

  const updatePassword = async (userId, currentPassword, newPassword) => {
    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/update-password`,
        {
          userId,
          currentPassword,
          newPassword,
        },
        {
          withCredentials: true,
        },
      );

      handleUpdateSuccess(response.data.message);
    } catch (error) {
      setError(
        error.response?.data?.message || "Error al actualizar la contraseña",
      );
      throw error;
    }
  };

  const handleUpdateSuccess = (message) => {
    setSuccessMessage(message);
    setError(""); // Clear any previous errors

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (settingsOption === "password") {
        if (newPassword !== confirmPassword) {
          setError("Las contraseñas nuevas no coinciden");
          return;
        }
        await updatePassword(userId, password, newPassword);
      } else if (settingsOption === "username") {
        if (!newUsername.trim()) {
          setError("El nombre de usuario no puede estar vacío");
          return;
        }
        await updateUsername(userId, newUsername);
      } else if (settingsOption === "email") {
        await updateEmail(userId, newEmail);
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  useEffect(() => {
    setMusicFacts((prevFacts) => {
      const shuffledFacts = [...prevFacts];
      for (let i = shuffledFacts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledFacts[i], shuffledFacts[j]] = [
          shuffledFacts[j],
          shuffledFacts[i],
        ];
      }
      return shuffledFacts;
    });
  }, []);

  const renderForm = () => {
    switch (settingsOption) {
      case "username":
        return (
          <form className="flex flex-col" onSubmit={handleSubmit}>
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
                autocomplete="off"
                className="input-box block w-full border border-light-secondary bg-light-background p-2.5 ps-10 text-sm text-light-text outline-none focus:border-light-highlight focus:ring-light-highlight dark:border-dark-secondary dark:bg-dark-background dark:text-dark-text dark:placeholder-dark-text dark:focus:border-dark-buttons dark:focus:ring-dark-buttons"
                placeholder="Nuevo usuario"
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </section>
            <button
              type="submit"
              className="bg-light-buttons px-2 py-1 dark:bg-dark-buttons"
            >
              Cambiar usuario
            </button>
          </form>
        );
      case "email":
        return (
          <form className="flex flex-col" onSubmit={handleSubmit}>
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
                id="email"
                required
                autocomplete="off"
                className="input-box block w-full border border-light-secondary bg-light-background p-2.5 ps-10 text-sm text-light-text outline-none focus:border-light-highlight focus:ring-light-highlight dark:border-dark-secondary dark:bg-dark-background dark:text-dark-text dark:placeholder-dark-text dark:focus:border-dark-buttons dark:focus:ring-dark-buttons"
                placeholder="Nuevo email"
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </section>
            <button
              type="submit"
              className="bg-light-buttons px-2 py-1 dark:bg-dark-buttons"
            >
              Cambiar email
            </button>
          </form>
        );
      case "password":
        return (
          <form className="flex flex-col" onSubmit={handleSubmit}>
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
                    d="M13.6667 8.99988L12 11.9999M12 11.9999L10.3333 8.99988M12 11.9999H9.5M12 11.9999H14.5M12 11.9999L10.3333 14.9999M12 11.9999L13.6667 14.9999M6.16667 8.99994L4.5 11.9999M4.5 11.9999L2.83333 8.99994M4.5 11.9999H2M4.5 11.9999H7M4.5 11.9999L2.83333 14.9999M4.5 11.9999L6.16667 14.9999M21.1667 8.99994L19.5 11.9999M19.5 11.9999L17.8333 8.99994M19.5 11.9999H17M19.5 11.9999H22M19.5 11.9999L17.8333 14.9999M19.5 11.9999L21.1667 14.9999"
                    stroke="#EB5E28"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <input
                type="password"
                name="currentPassword"
                required
                autocomplete="off"
                className="input-box block w-full border border-light-secondary bg-light-background p-2.5 ps-10 text-sm text-light-text outline-none focus:border-light-highlight focus:ring-light-highlight dark:border-dark-secondary dark:bg-dark-background dark:text-dark-text dark:placeholder-dark-text dark:focus:border-dark-buttons dark:focus:ring-dark-buttons"
                placeholder="Contraseña Actual"
                value={password}
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
                name="newPassword"
                required
                autocomplete="off"
                className="input-box block w-full border border-light-secondary bg-light-background p-2.5 ps-10 text-sm text-light-text outline-none focus:border-light-highlight focus:ring-light-highlight dark:border-dark-secondary dark:bg-dark-background dark:text-dark-text dark:placeholder-dark-text dark:focus:border-dark-buttons dark:focus:ring-dark-buttons"
                placeholder="Nueva Contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                name="confirmNewPassword"
                required
                autocomplete="off"
                onpaste="return false;"
                className="scroll-placeholder input-box block w-full border border-light-secondary bg-light-background p-2.5 ps-10 text-sm text-light-text outline-none focus:border-light-highlight focus:ring-light-highlight dark:border-dark-secondary dark:bg-dark-background dark:text-dark-text dark:placeholder-dark-text dark:focus:border-dark-buttons dark:focus:ring-dark-buttons"
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </section>

            <button
              type="submit"
              className="bg-light-buttons px-2 py-1 dark:bg-dark-buttons"
            >
              Cambiar Contraseña
            </button>
          </form>
        );
      default:
        return (
          <div className="mx-auto max-w-[300px] p-4 text-center">
            <Typewriter
              options={{
                strings: musicFacts,
                autoStart: true,
                loop: true,
                delay: 50,
                deleteSpeed: 20,
                pauseFor: 5000,
              }}
            />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center px-2 py-5">
      {successMessage && (
        <p className="mb-4 text-green-500">{successMessage}</p>
      )}
      {error && <p className="mb-4 text-red-500">{error}</p>}
      {renderForm()}
    </div>
  );
}

export default ChangeUser;
