import { React, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [status, setStatus] = useState("Verificando email...");
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/verify-email/${token}`,
          { withCredentials: true },
        );

        if (response.status === 200) {
          setStatus("Email verificado correctamente!");
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        }
      } catch (error) {
        setStatus(
          error.response?.data?.message || "Error al verificar el email",
        );
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-lg bg-light-background p-8 shadow-lg dark:bg-dark-background">
        <h2 className="mb-4 text-2xl font-bold text-light-text dark:text-dark-text">
          Verificación de Email
        </h2>
        <p className="text-light-text dark:text-dark-text">{status}</p>
      </div>
    </div>
  );
};

export default VerifyEmail;
