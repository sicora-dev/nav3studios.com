import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

function CancelPayment() {
  return (
    <main className="flex h-full w-full flex-col items-center">
      <h2 className="p-10 text-center font-title text-3xl font-bold text-light-buttons dark:text-light-buttons">
        PAGO CANCELADO
      </h2>
    </main>
  );
}

export default CancelPayment;
