import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

function SuccessPayment() {
  const location = useLocation();
  const [paymentDetails, setPaymentDetails] = useState({
    sessionId: "",
    paymentStatus: "",
    paymentMethod: "",
    amountTotal: "",
    paymentDate: "",
    products: [],
  });

  return (
    <main className="flex h-full w-full flex-col items-center">
      <h2 className="p-10 text-center font-title text-3xl font-bold text-light-buttons dark:text-light-buttons">
        PAGO RECIBIDO
      </h2>
      <div className="space-y-4 text-light-buttons">
        <p>ID de Sesión: {paymentDetails.sessionId}</p>
        <p>Estado del Pago: {paymentDetails.paymentStatus}</p>
        <p>Método de Pago: {paymentDetails.paymentMethod}</p>
        <p>Total: €{paymentDetails.amountTotal}</p>
        <p>Fecha del Pago: {paymentDetails.paymentDate}</p>
        <div>
          <p>Productos:</p>
          <ul>
            {paymentDetails.products.map((product, index) => (
              <li key={index}>
                ID: {product.id} - Cantidad: {product.quantity}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

export default SuccessPayment;
