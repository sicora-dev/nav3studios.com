import React, { useEffect, useState, useCallback, useMemo } from "react";
import debounce from "lodash/debounce";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import { es } from "date-fns/locale";
import "react-day-picker/style.css";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { set } from "date-fns";
import LoadingSpinner from "../components/LoadingSpinner";

function Reserva() {
  const [user, setUser] = useState([]);
  const [services, setServices] = useState([]);
  const [producers, setProducers] = useState([]);
  const [freeHours, setFreeHours] = useState([]);

  const [selectedProducer, setSelectedProducer] = useState(1);
  const [selectedService, setSelectedService] = useState(1);
  const [serviceName, setServiceName] = useState();
  const [selectedHour, setSelectedHour] = useState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookingDate, setBookingDate] = useState();
  const [paymentMethod, setPaymentMethod] = useState(-1);

  const [isPayPalReady, setIsPayPalReady] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [servicePrice, setServicePrice] = useState(0);

  const [next, setNext] = useState(3);
  const [bookingCreated, setBookingCreated] = useState(null);
  const [activeDiv, setActiveDiv] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [mode, setMode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");
  const defaultClassNames = getDefaultClassNames();
  const allHours = [9, 11, 13, 15, 17, 19];

  const [dateCache, setDateCache] = useState({});

  const navigate = useNavigate();

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${process.env.REACT_APP_BACKEND_URL}/check-auth`,
  //         {
  //           withCredentials: true,
  //         },
  //       );
  //       if (response.status !== 200) {
  //         throw new Error("Not authenticated");
  //       }
  //     } catch (error) {
  //       navigate("/login", { state: { fromReserva: true } });
  //       setError("Debes iniciar sesión para hacer una reserva");
  //     }
  //   };
  //   checkAuth();
  // }, [navigate]);

  useEffect(() => {
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    const day = selectedDate.getDate().toString().padStart(2, "0");
    const formatedDate = `${selectedDate.getFullYear()}-${month}-${day} ${selectedHour}:00:00`;

    setBookingDate(formatedDate);
  }, [selectedDate, selectedHour]);

  const debouncedFetchHours = useMemo(
    () =>
      debounce(async (date) => {
        // Agregar validación de cache expirado
        const cacheExpiry = 5 * 60 * 1000; // 5 minutos
        const cacheEntry = dateCache[date];

        if (cacheEntry && Date.now() - cacheEntry.timestamp < cacheExpiry) {
          setFreeHours(cacheEntry.hours);
          return;
        }

        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/bookings/date`,
            { params: { date } },
          );
          const newHours = response.data.freeRanges || [];

          setDateCache((prev) => ({
            ...prev,
            [date]: {
              hours: newHours,
              timestamp: Date.now(),
            },
          }));

          setFreeHours(newHours);
        } catch (error) {
          console.error("Failed to fetch free hours:", error);
        }
      }, 500),
    [dateCache],
  );

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
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/user-token`, {
        withCredentials: true,
      })
      .then((response) => {
        setUser(parseInt(response.data.id));
      });

    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/services`)
      .then((response) => {
        setServices(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching services!", error);
      });

    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/producers`)
      .then((response) => {
        setProducers(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching producers!", error);
      });
  }, []);

  const createOrder = async () => {
    try {
      try {
        const serviceName = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/services/${selectedService}/name`,
        );
        setServiceName(serviceName.data.name);
      } catch (error) {
        console.error("Error al obtener el nombre del servicio:", error);
        setError("Error al obtener el nombre del servicio");
      }
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/create-paypal-order`,
          {
            userId: user,
            producerId: selectedProducer,
            serviceId: selectedService,
            bookingDate: bookingDate,
            serviceName: serviceName,
            amount: servicePrice,
          },
        );

        if (!response.data.orderId) {
          throw new Error("No order ID received");
        }

        return response.data.orderId;
      } catch (error) {
        console.error("Error creating PayPal order:", error);
        setPaymentError("Error creating payment order");
        throw error;
      }
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      setPaymentError(
        "Error al crear la orden de pago. Intentalo de nuevo, si persiste, póngase en contacto con nosotros.",
      );
    }
  };

  const onApprove = async (data) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/capture-paypal-order/${data.orderID}`,
        {
          userId: parseInt(user),
          producerId: selectedProducer,
          serviceId: selectedService,
          booking_date: bookingDate,
          payment_method: 2,
        },
      );
      if (response.data.status === "COMPLETED") {
        navigate("/success");
      }
    } catch (error) {
      console.error("Error capturing payment:", error);
      setPaymentError("Error processing payment");
    }
  };

  const fetchFreeHours = useCallback(() => {
    if (!selectedDate) return;

    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    const adjustedDate = date.toISOString().split("T")[0];

    debouncedFetchHours(adjustedDate);
  }, [selectedDate, debouncedFetchHours]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    if (
      !selectedProducer ||
      !selectedService ||
      !bookingDate ||
      !paymentMethod ||
      !user
    ) {
      setError("Por favor, rellena todos los campos");
      return;
    }

    if (paymentMethod === 1) {
      try {
        setError(null);
        setBookingCreated(false);

        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/createBooking`,
          {
            userId: user,
            producerId: selectedProducer,
            serviceId: selectedService,
            booking_date: bookingDate,
            payment_method: paymentMethod,
          },
          {
            withCredentials: true,
          },
        );

        setBookingCreated(true);

        setIsSubmitting(false);
        navigate("/account");
      } catch (error) {
        console.error("Failed to create booking:", error);
        setError("Error al crear la reserva");
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = async () => {
    setPaymentMethod(1);
    if (next < 1) return;
    setNext(next - 1);
  };

  const handlePaymentMethod = (e) => {
    const value = e.target.value;
    setPaymentMethod(value === "online" ? 2 : 1);
    setPaymentError("");
  };
  const handleNext = async (page) => {
    if (page < 0 || page > 3) return;
    if (page !== 2) {
      setNext(next + 1);
      return;
    }

    if (page === 2) {
      setLoadingDetails(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/services/${selectedService}/price`,
        );
        setServicePrice(response.data.price);
        setLoadingDetails(false);
        setNext(next + 1);
      } catch (error) {
        setLoadingDetails(false);
        console.error("Error al obtener el precio del servicio:", error);
        setError("Error al obtener el precio del servicio");
      }
    }
    if (page === 3) {
      setNext(3);
      return;
    }
  };

  useEffect(() => {
    fetchFreeHours();
  }, [selectedDate]);

  return (
    <main className="flex h-fit w-full flex-col items-center">
      <h2 className="p-10 text-center font-title text-3xl font-bold text-light-buttons dark:text-light-buttons">
        HAZ TU RESERVA
      </h2>
      <div
        key={1}
        onMouseMove={(e) => handleMouseMove(e, 1)}
        onMouseEnter={() => handleMouseEnter(1)}
        onMouseLeave={handleMouseLeave}
        className="relative mb-28 flex h-fit min-w-[90%] border border-light-text bg-gradient-to-b from-light-background to-light-secondary px-8 py-8 shadow-2xl transition-all duration-500 ease-in-out md:min-w-fit dark:border-dark-secondary dark:from-dark-background dark:to-dark-secondary"
      >
        <input
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-10 h-full w-full cursor-default border-2 border-[#eb5e28]/50 transition-opacity duration-500 placeholder:select-none"
          style={{
            opacity: activeDiv === 1 ? opacity : 0,
            WebkitMaskImage: `radial-gradient(30% 30px at ${position.x}px ${position.y}px, black 45%, transparent)`,
            backgroundColor: "transparent",
          }}
        />
        <div
          className="pointer-events-none absolute -inset-px w-full opacity-0 transition duration-300"
          style={{
            opacity: activeDiv === 1 ? opacity : 0,
            background:
              activeDiv === 1
                ? `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${mode === "dark" ? "rgba(235, 94, 40, 0.1)" : "rgba(200, 80, 35, 0.1)"}, transparent 40%)`
                : "none",
          }}
        />
        {next === 0 && (
          <form
            className="flex w-full flex-col items-center gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleNext(0);
            }}
          >
            <div>
              <section className="flex flex-col">
                <label
                  for="producer_select"
                  className="font-title text-xl font-bold"
                >
                  Productor
                </label>
                <select
                  id="producer_select"
                  name="producer"
                  required
                  className="w-[322px] bg-light-background p-2 dark:bg-dark-background"
                  onChange={(e) => setSelectedProducer(e.target.value)}
                >
                  {producers.map((producer) => (
                    <option
                      key={producer.id}
                      value={producer.id}
                      className="text-light-text dark:text-dark-text"
                    >
                      {producer.username}
                    </option>
                  ))}
                </select>
              </section>
            </div>

            {error && (
              <p className="w-full text-center font-title text-sm font-bold text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="bg-light-buttons px-2 py-1 dark:bg-dark-buttons"
            >
              Siguiente
            </button>
          </form>
        )}
        {next === 1 && (
          <form
            className="flex w-full flex-col items-center gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
          >
            <div>
              <section className="flex flex-col">
                <label
                  for="service_select"
                  className="font-title text-xl font-bold"
                >
                  Servicio
                </label>
                <select
                  id="service_select"
                  name="service"
                  required
                  className="w-[322px] bg-light-background p-2 dark:bg-dark-background"
                  onChange={(e) => setSelectedService(e.target.value)}
                >
                  {services.map((service) => (
                    <option
                      key={service.id}
                      value={service.id}
                      className="text-light-text dark:text-dark-text"
                    >
                      {service.name}
                    </option>
                  ))}
                </select>
              </section>
            </div>
            {error && (
              <p className="w-full text-center font-title text-sm font-bold text-red-700">
                {error}
              </p>
            )}
            <div className="flex justify-center gap-5">
              <button
                type="button"
                onClick={handleBack}
                className="bg-light-secondary px-2 py-1 dark:bg-dark-secondary"
              >
                Volver
              </button>

              <button
                type="submit"
                className="bg-light-buttons px-2 py-1 dark:bg-dark-buttons"
              >
                Siguiente
              </button>
            </div>
          </form>
        )}
        {next === 2 && (
          <form
            className="flex w-full flex-col items-center gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
          >
            <div>
              <section className="flex max-w-full justify-center">
                <DayPicker
                  mode="single"
                  locale={es}
                  classNames={{
                    container: "flex flex-col gap-5",
                    caption: "text-xl font-bold",
                    body: "grid grid-cols-7 gap-2",
                    today:
                      "text-light-highlight dark:text-dark-highlight font-bold",
                    selected: "bg-light-buttons dark:bg-dark-buttons",
                    disabled: "text-gray-400",
                    outside: "text-gray-400",
                    footer: "font-title text-xl font-bold",
                    chevron: " fill-light-buttons",
                  }}
                  required
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date); // Store the Date object directly
                  }}
                  disabled={{ before: new Date() }}
                  footer={
                    selectedDate && !selectedHour
                      ? `Dia: ${selectedDate.toLocaleDateString()}`
                      : selectedDate && selectedHour
                        ? `Dia: ${selectedDate.toLocaleDateString()} Hora: ${selectedHour}:00 - ${selectedHour + 2}:00`
                        : "Selecciona un día."
                  }
                />
              </section>
              {selectedDate && (
                <section className="flex flex-col">
                  <label
                    for="hour_select"
                    className="font-title text-xl font-bold"
                  >
                    Horas disponibles
                  </label>
                  <select
                    id="hour_select"
                    name="producer"
                    required
                    className="w-[322px] bg-light-background p-2 dark:bg-dark-background"
                    onChange={(e) => setSelectedHour(Number(e.target.value))}
                  >
                    {allHours.map((hour) => (
                      <option
                        key={hour}
                        value={hour}
                        disabled={!freeHours.includes(hour)}
                        className="text-light-text disabled:font-bold disabled:text-gray-600 dark:text-dark-text"
                      >
                        {hour}:00 - {hour + 2}:00
                        {!freeHours.includes(hour) && " (No disponible) "}
                      </option>
                    ))}
                  </select>
                </section>
              )}
            </div>
            <div className="flex justify-center gap-5">
              <button
                type="button"
                onClick={handleBack}
                className="bg-light-secondary px-2 py-1 dark:bg-dark-secondary"
              >
                Volver
              </button>

              <button
                type="submit"
                className="bg-light-buttons px-2 py-1 dark:bg-dark-buttons"
              >
                Siguiente
              </button>
            </div>
          </form>
        )}
        {next === 3 && (
          <>
            {loadingDetails && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="relative flex w-full flex-col items-center justify-center gap-4">
                  <LoadingSpinner />
                </div>
              </div>
            )}
            <div className="flex-col">
              <div className="flex flex-col items-center">
                <h2 className="text-center font-title text-3xl font-bold text-light-highlight dark:text-dark-highlight">
                  Resumen de la reserva
                </h2>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-5">
                    <p className="text-light-text dark:text-dark-text">
                      Productor:{" "}
                      <span className="font-bold">{selectedProducer}</span>
                    </p>
                    <p className="text-light-text dark:text-dark-text">
                      Servicio:{" "}
                      <span className="font-bold">{selectedService}</span>
                    </p>
                    <p className="text-light-text dark:text-dark-text">
                      Fecha:{" "}
                      <span className="font-bold">
                        {selectedDate.toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-light-text dark:text-dark-text">
                      Hora:{" "}
                      <span className="font-bold">
                        {selectedHour}:00 - {selectedHour + 2}:00
                      </span>
                    </p>
                    <p className="text-light-text dark:text-dark-text">
                      Precio: <span className="font-bold">{servicePrice}€</span>
                    </p>
                  </div>
                </div>
              </div>
              <form
                className="flex w-full flex-col items-center gap-5"
                onSubmit={(e) => handleSubmit(e)}
              >
                <label className="mt-5 font-title text-xl font-bold">
                  Metodo de pago
                </label>
                <ul className="flex items-center gap-5">
                  <li>
                    <input
                      type="radio"
                      id="cash"
                      value="cash"
                      name="payment"
                      className="peer hidden"
                      onChange={(e) => {
                        handlePaymentMethod(e);
                      }}
                    ></input>
                    <label
                      htmlFor="cash"
                      className="cursor-pointer bg-light-secondary px-2 py-1 shadow-[0_0.5em_0.5em_-0.4em_#EB5E28] transition ease-in-out active:translate-y-1 active:text-light-highlight active:shadow-none md:shadow-none md:hover:-translate-y-1 md:hover:text-light-highlight md:hover:shadow-[0_0.5em_0.5em_-0.4em_#EB5E28] md:peer-checked:-translate-y-1 md:peer-checked:shadow-[0_0.5em_0.5em_-0.4em_#EB5E28] dark:bg-dark-secondary active:dark:text-dark-highlight md:dark:hover:text-dark-highlight"
                      style={{ display: "inline-block" }}
                    >
                      Efectivo
                    </label>
                  </li>
                  <li>
                    <input
                      type="radio"
                      id="online"
                      value="online"
                      name="payment"
                      className="peer hidden"
                      onChange={(e) => {
                        handlePaymentMethod(e);
                      }}
                    ></input>
                    <label
                      htmlFor="online"
                      className="cursor-pointer bg-light-secondary px-2 py-1 shadow-[0_0.5em_0.5em_-0.4em_#EB5E28] transition ease-in-out active:translate-y-1 active:text-light-highlight active:shadow-none md:shadow-none md:hover:-translate-y-1 md:hover:text-light-highlight md:hover:shadow-[0_0.5em_0.5em_-0.4em_#EB5E28] md:peer-checked:-translate-y-1 md:peer-checked:shadow-[0_0.5em_0.5em_-0.4em_#EB5E28] dark:bg-dark-secondary active:dark:text-dark-highlight md:dark:hover:text-dark-highlight"
                      style={{ display: "inline-block" }} // Asegúrate de que el label sea un elemento en línea
                    >
                      Paypal
                    </label>
                  </li>
                </ul>

                {paymentMethod === 2 && (
                  <div className="w-[322px]">
                    <PayPalButtons
                      createOrder={createOrder}
                      onApprove={onApprove}
                      onError={(err) => {
                        console.error("PayPal Error:", err);
                        setPaymentError("Error processing payment");
                      }}
                      style={{ layout: "horizontal" }}
                      disabled={!servicePrice} // Deshabilita si no hay precio
                    />
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="bg-light-secondary px-2 py-1 dark:bg-dark-secondary"
                      >
                        Volver
                      </button>
                    </div>
                    {paymentError && (
                      <div className="mt-2 text-red-700">{paymentError}</div>
                    )}
                  </div>
                )}
                {paymentMethod === 1 && (
                  <div className="flex justify-center gap-5">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="bg-light-secondary px-2 py-1 dark:bg-dark-secondary"
                    >
                      Volver
                    </button>

                    <button
                      type="submit"
                      className="bg-light-buttons px-2 py-1 dark:bg-dark-buttons"
                    >
                      Confirmar
                    </button>
                  </div>
                )}
                {paymentMethod === -1 && (
                  <div className="flex justify-center gap-5">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="bg-light-secondary px-2 py-1 dark:bg-dark-secondary"
                    >
                      Volver
                    </button>
                  </div>
                )}

                {paymentError && (
                  <div className="mt-2 text-red-700">{paymentError}</div>
                )}
              </form>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default Reserva;
