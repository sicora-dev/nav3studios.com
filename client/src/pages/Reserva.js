import React, { useEffect, useState, useCallback, useMemo } from "react";
import debounce from "lodash/debounce";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import "react-day-picker/style.css";
import { PayPalButtons } from "@paypal/react-paypal-js";

import LoadingSpinner from "../components/LoadingSpinner";
import Stepper from "@mui/joy/Stepper";
import Step, { stepClasses } from "@mui/joy/Step";
import StepIndicator, { stepIndicatorClasses } from "@mui/joy/StepIndicator";

import HeadphonesRoundedIcon from "@mui/icons-material/HeadphonesRounded";
import MusicNoteRoundedIcon from "@mui/icons-material/MusicNoteRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import "../styles/reserva.css";

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

function Reserva() {
  const [user, setUser] = useState([]);
  const [services, setServices] = useState([
    // {
    //   id: "1",
    //   name: "Grabación",
    //   price: "30.00",
    // },
    // {
    //   id: "2",
    //   name: "Mezcla y master",
    //   price: "45.00",
    // },
    // {
    //   id: "3",
    //   name: "Beat",
    //   price: "35.00",
    // },
    // {
    //   id: "4",
    //   name: "Sesión completa",
    //   price: "85.00",
    // },
  ]);
  const [producers, setProducers] = useState([
    // {
    //   id: 1,
    //   username: "Najerax",
    // },
    // {
    //   id: 2,
    //   username: "Roux",
    // },
  ]);
  const [freeHours, setFreeHours] = useState([]);

  const [selectedProducer, setSelectedProducer] = useState();
  const [producerName, setproducerName] = useState("");
  const [producerEmail, setProducerEmail] = useState("");
  const [selectedService, setSelectedService] = useState();
  const [serviceName, setServiceName] = useState();
  const [servicePrice, setServicePrice] = useState(0);
  const [selectedHour, setSelectedHour] = useState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookingDate, setBookingDate] = useState();
  const [paymentMethod, setPaymentMethod] = useState();

  const [paymentError, setPaymentError] = useState("");

  const [next, setNext] = useState(0);

  const [activeDiv, setActiveDiv] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [mode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingHours, setLoadingHours] = useState(true);
  const [error, setError] = useState("");
  const allHours = [9, 11, 13, 15, 17, 19];

  const [dateCache, setDateCache] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/check-auth`,
          {
            withCredentials: true,
          },
        );
        if (response.status !== 200) {
          throw new Error("Not authenticated");
        }
      } catch (error) {
        navigate("/login", { state: { fromReserva: true } });
        setError("Debes iniciar sesión para hacer una reserva");
      }
    };
    checkAuth();
  }, [navigate]);

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
        setLoadingHours(true);
        const cacheExpiry = 5 * 60 * 1000; // 5 minutos
        const cacheEntry = dateCache[date];

        if (cacheEntry && Date.now() - cacheEntry.timestamp < cacheExpiry) {
          setLoadingHours(false);
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
          setLoadingHours(false);
        } catch (error) {
          setLoadingHours(false);
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

        await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/createBooking`,
          {
            userId: user,
            producerId: selectedProducer,
            producerEmail: producerEmail,
            serviceId: selectedService,
            serviceName: serviceName,
            booking_date: bookingDate,
            payment_method: paymentMethod,
          },
          {
            withCredentials: true,
          },
        );

        setIsSubmitting(false);
        navigate("/account");
      } catch (error) {
        console.error("Failed to create booking:", error);
        setError("Error al crear la reserva");
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = async (page) => {
    setPaymentMethod(null);
    setPaymentError("");
    setError(null);
    if (page <= 0) return;
    if (page === 1) {
      setSelectedProducer(null);
      setNext(next - 1);
      return;
    }
    if (page === 2) {
      setSelectedService(null);
      setNext(next - 1);
      return;
    }

    if (page === 3) {
      setSelectedDate(new Date());
      setSelectedHour(null);
      setNext(next - 1);
      return;
    }
  };

  const handlePaymentMethod = (e) => {
    const value = e.target.value;
    setPaymentMethod(value === "online" ? 2 : 1);
    setPaymentError("");
  };
  const handleNext = async (page) => {
    if (page < 0 || page > 3) return;

    if (page === 0) {
      if (!selectedProducer) {
        setError("Por favor, selecciona un productor");
        return;
      }
      setError(null);
      setNext(next + 1);
    }
    if (page === 1) {
      if (!selectedService) {
        setError("Por favor, selecciona un servicio");
        return;
      }
      setError(null);
      setNext(next + 1);
    }

    if (page === 2) {
      setLoadingDetails(true);
      if (!selectedDate || !selectedHour) {
        setError("Por favor, selecciona una fecha y hora");
        return;
      }
      try {
        const price = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/services/${selectedService}/price`,
        );
        setServicePrice(price.data.price);
        const name = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/services/${selectedService}/name`,
        );
        setServiceName(name.data.name);
        const fullProducer = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/producer/${selectedProducer}`,
        );
        console.log(fullProducer);
        setproducerName(fullProducer.data.username);
        setProducerEmail(fullProducer.data.email);
        setLoadingDetails(false);
        setNext(next + 1);
      } catch (error) {
        setLoadingDetails(false);
        console.error("Error al obtener los detalles de la reserva", error);
        setError("Error al obtener los detalles de la reserva");
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
      <section className="mb-[1em] flex w-full max-w-[70%]">
        <Stepper
          size="lg"
          sx={{
            width: "100%",
            "--StepIndicator-size": "3rem",
            "--Step-connectorInset": "0px",
            [`& .${stepIndicatorClasses.root}`]: {
              borderWidth: 2,
              borderColor: "var(--secondary)",
            },
            [`& .${stepClasses.root}::after`]: {
              height: 2,
              backgroundColor: "var(--secondary)",
            },
            [`& .${stepClasses.completed}`]: {
              [`& .${stepIndicatorClasses.root}`]: {
                borderColor: "var(--buttons)",
                color: "var(--buttons)",
              },
              "&::after": {
                bgcolor: "var(--buttons)",
              },
            },
            [`& .${stepClasses.active}`]: {
              [`& .${stepIndicatorClasses.root}`]: {
                borderColor: "var(--buttons)",
                color: "var(--text)",
              },
            },
            [`& .${stepClasses.disabled} *`]: {
              color: "var(--highlight)",
            },
          }}
        >
          <Step
            completed={next > 0}
            active={next === 0}
            orientation="vertical"
            indicator={
              <StepIndicator
                variant={next === 0 ? "solid" : "outlined"}
                sx={{
                  color: next === 0 ? "var(--text)" : "var(--buttons)",
                  borderColor:
                    next === 0 ? "var(--buttons)" : "var(--secondary)",
                  backgroundColor:
                    next === 0 ? "var(--secondary)" : "transparent",
                }}
              >
                <HeadphonesRoundedIcon />
              </StepIndicator>
            }
          />
          <Step
            completed={next > 1}
            active={next === 1}
            orientation="vertical"
            indicator={
              <StepIndicator
                variant={next === 1 ? "solid" : "outlined"}
                sx={{
                  color: next === 1 ? "var(--text)" : "var(--buttons)",
                  borderColor:
                    next === 1 ? "var(--buttons)" : "var(--secondary)",
                  backgroundColor:
                    next === 1 ? "var(--secondary)" : "transparent",
                }}
              >
                <MusicNoteRoundedIcon />
              </StepIndicator>
            }
          />
          <Step
            completed={next > 2}
            active={next === 2}
            orientation="vertical"
            indicator={
              <StepIndicator
                variant={next === 2 ? "solid" : "outlined"}
                sx={{
                  color: next === 2 ? "var(--text)" : "var(--buttons)",
                  borderColor:
                    next === 2 ? "var(--buttons)" : "var(--secondary)",
                  backgroundColor:
                    next === 2 ? "var(--secondary)" : "transparent",
                }}
              >
                <EventRoundedIcon />
              </StepIndicator>
            }
          />
          <Step
            completed={next > 3}
            active={next === 3}
            orientation="vertical"
            indicator={
              <StepIndicator
                variant={next === 3 ? "solid" : "outlined"}
                sx={{
                  color: next === 3 ? "var(--text)" : "var(--buttons)",
                  borderColor:
                    next === 3 ? "var(--buttons)" : "var(--secondary)",
                  backgroundColor:
                    next === 3 ? "var(--secondary)" : "transparent",
                }}
              >
                <ReceiptLongRoundedIcon />
              </StepIndicator>
            }
          />
        </Stepper>
      </section>

      <div
        key={1}
        onMouseMove={(e) => handleMouseMove(e, 1)}
        onMouseEnter={() => handleMouseEnter(1)}
        onMouseLeave={handleMouseLeave}
        className="relative mb-28 flex h-fit min-w-[70%] items-center justify-center rounded-md border border-light-text bg-gradient-to-b from-light-background to-light-secondary px-8 py-8 shadow-2xl transition-all duration-500 ease-in-out lg:min-w-[40%] dark:border-dark-secondary dark:from-dark-background dark:to-dark-secondary"
      >
        <input
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-10 h-full w-full cursor-default rounded-md border-2 border-[#eb5e28]/50 transition-opacity duration-500 placeholder:select-none"
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
              handleNext(next);
            }}
          >
            <div>
              <section className="flex flex-col">
                <label className="mb-[1em] text-center font-title text-2xl font-bold">
                  Productor
                </label>

                <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {producers.map((producer) => (
                    <li className="flex items-center justify-center text-center">
                      <input
                        type="radio"
                        name="producer"
                        className="peer hidden"
                        id={producer.id}
                        onChange={() => setSelectedProducer(producer.id)}
                      />
                      <label
                        htmlFor={producer.id}
                        className="group/item cursor-pointer peer-checked:text-light-buttons"
                      >
                        <img
                          className="w-28 rounded-md"
                          alt={producer.id}
                          src={`/assets/producer_${producer.username}.webp`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/assets/producer_Najerax.webp";
                          }}
                        ></img>
                        <p className="group text-center text-lg font-bold">
                          <span className="relative">
                            {producer.username}
                            <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-light-buttons transition-all duration-300 ease-in-out group-hover/item:w-full peer-checked:w-full dark:bg-dark-buttons"></span>
                          </span>
                        </p>
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {error && (
              <p className="w-full text-center font-title text-sm font-bold text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="rounded-md bg-light-buttons px-2 py-1 dark:bg-dark-buttons"
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
              handleNext(next);
            }}
          >
            <div>
              <section className="flex flex-col">
                <label
                  for="service_select"
                  className="mb-[1em] text-center font-title text-2xl font-bold"
                >
                  Servicio
                </label>

                <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {services.map((service) => (
                    <li
                      className="group/service flex items-center justify-center text-center"
                      key={service.id}
                    >
                      <input
                        type="radio"
                        name="service"
                        className="peer hidden"
                        id={service.id}
                        onChange={() => {
                          console.log(service.id);
                          setSelectedService(service.id);
                        }}
                      />
                      <label
                        htmlFor={service.id}
                        className={`group/item w-full cursor-pointer px-2 py-1 peer-checked:text-light-buttons`}
                      >
                        <p className="group flex flex-col items-center justify-center rounded-md bg-light-secondary px-2 py-1 text-center text-lg font-bold dark:bg-dark-secondary">
                          <img
                            className="w-10 transition-all duration-300"
                            alt={service.name}
                            src={`/assets/${service.id}.svg`}
                          ></img>
                          <span className="relative">
                            {service.name}
                            <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-light-buttons transition-all duration-300 ease-in-out group-hover/item:w-full peer-checked:w-full dark:bg-dark-buttons"></span>
                          </span>
                        </p>
                      </label>
                    </li>
                  ))}
                </ul>
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
                onClick={(e) => {
                  e.preventDefault();
                  handleBack(next);
                }}
                className="rounded-md bg-light-secondary px-2 py-1 dark:bg-dark-secondary"
              >
                Volver
              </button>

              <button
                type="submit"
                className="rounded-md bg-light-buttons px-2 py-1 dark:bg-dark-buttons"
              >
                Siguiente
              </button>
            </div>
          </form>
        )}
        {next === 2 && (
          <div className="flex flex-col items-center">
            <label className="mb-[1em] text-center font-title text-2xl font-bold">
              Fecha y Hora
            </label>
            <form
              className="flex h-fit w-full flex-col items-center justify-center gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                handleNext(next);
              }}
            >
              <div className="flex flex-col items-center justify-center gap-5 lg:flex-row">
                <section className="flex max-w-full items-center justify-center">
                  <DayPicker
                    mode="single"
                    locale={es}
                    classNames={{
                      container: "flex flex-col gap-5",
                      month_caption: "text-xl font-bold ",
                      caption: "text-xl font-bold",
                      body: "grid grid-cols-7 gap-2",
                      day: "font-bold",
                      today: "text-gray-400",
                      selected:
                        "bg-light-buttons dark:bg-dark-buttons rounded-md",
                      disabled: "text-gray-400",
                      outside: "text-gray-400",
                      footer: "font-title text-xl font-bold",
                      chevron: " fill-light-buttons",
                    }}
                    required
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedHour(null); // Store the Date object directly
                    }}
                    disabled={{
                      before: tomorrow, // This disables today and all past dates
                    }}
                  />
                </section>
                <div className="h-fit">
                  {selectedDate && (
                    <section className="relative mb-[1em] flex flex-col self-start">
                      {loadingHours && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
                          <div className="relative flex w-full flex-col items-center justify-center gap-4">
                            <LoadingSpinner />
                          </div>
                        </div>
                      )}
                      {allHours.length === 0 ? (
                        <p>
                          No quedan horas disponibles para el día seleccionado
                        </p>
                      ) : (
                        <ul className="grid grid-cols-2 gap-5">
                          {allHours.map((hour) => {
                            const isAvailable = freeHours.includes(hour);
                            return (
                              <li className="flex items-center justify-center text-center">
                                <input
                                  type="radio"
                                  name="hora"
                                  className="peer hidden"
                                  id={hour}
                                  disabled={!isAvailable}
                                  onChange={() =>
                                    isAvailable && setSelectedHour(hour)
                                  }
                                />
                                <label
                                  htmlFor={hour}
                                  className={`w-full cursor-pointer rounded-md px-2 py-1 ${
                                    isAvailable
                                      ? "bg-light-secondary peer-checked:bg-light-buttons dark:bg-dark-secondary dark:peer-checked:bg-dark-buttons"
                                      : "cursor-not-allowed bg-gray-300 opacity-50 dark:bg-gray-700"
                                  }`}
                                >
                                  {hour}:00 - {hour + 2}:00
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </section>
                  )}
                </div>
              </div>
              {error && (
                <p className="w-full text-center font-title text-sm font-bold text-red-700">
                  {error}
                </p>
              )}
              <div className="flex h-fit justify-center gap-5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleBack(next);
                  }}
                  className="rounded-md bg-light-secondary px-2 py-1 dark:bg-dark-secondary"
                >
                  Volver
                </button>

                <button
                  type="submit"
                  className="rounded-md bg-light-buttons px-2 py-1 dark:bg-dark-buttons"
                >
                  Siguiente
                </button>
              </div>
            </form>
          </div>
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
            <div className="w-full flex-col">
              <div className="flex w-full flex-col items-center">
                <h2 className="mb-[1em] w-60 flex-wrap text-center font-title text-2xl font-bold text-light-highlight md:w-full dark:text-dark-highlight">
                  Resumen de la Reserva
                </h2>
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="text-center">
                      <p className="text-light-text dark:text-dark-text">
                        Productor
                      </p>
                      <p className="font-bold">{producerName}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-light-text dark:text-dark-text">
                        Servicio
                      </p>
                      <p className="font-bold">{serviceName}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-light-text dark:text-dark-text">
                        Fecha
                      </p>
                      <p className="font-bold">
                        {selectedDate.toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-light-text dark:text-dark-text">
                        Hora
                      </p>
                      <p className="font-bold">
                        {selectedHour}:00 - {selectedHour + 2}:00
                      </p>
                    </div>
                    <div className="col-span-2 text-center">
                      <p className="text-light-text dark:text-dark-text">
                        Precio
                      </p>
                      <p className="font-bold">{servicePrice}€</p>
                    </div>
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
                      className="cursor-pointer rounded-md bg-light-secondary px-2 py-1 shadow-[0_0.5em_0.5em_-0.4em_#EB5E28] transition ease-in-out active:translate-y-1 active:text-light-highlight active:shadow-none md:shadow-none md:hover:-translate-y-1 md:hover:text-light-highlight md:hover:shadow-[0_0.5em_0.5em_-0.4em_#EB5E28] md:peer-checked:-translate-y-1 md:peer-checked:shadow-[0_0.5em_0.5em_-0.4em_#EB5E28] dark:bg-dark-secondary active:dark:text-dark-highlight md:dark:hover:text-dark-highlight"
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
                      className="cursor-pointer rounded-md bg-light-secondary px-2 py-1 shadow-[0_0.5em_0.5em_-0.4em_#EB5E28] transition ease-in-out active:translate-y-1 active:text-light-highlight active:shadow-none md:shadow-none md:hover:-translate-y-1 md:hover:text-light-highlight md:hover:shadow-[0_0.5em_0.5em_-0.4em_#EB5E28] md:peer-checked:-translate-y-1 md:peer-checked:shadow-[0_0.5em_0.5em_-0.4em_#EB5E28] dark:bg-dark-secondary active:dark:text-dark-highlight md:dark:hover:text-dark-highlight"
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
                        onClick={(e) => {
                          e.preventDefault();
                          handleBack(next);
                        }}
                        className="rounded-md bg-light-secondary px-2 py-1 dark:bg-dark-secondary"
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
                      onClick={(e) => {
                        e.preventDefault();
                        handleBack(next);
                      }}
                      className="rounded-md bg-light-secondary px-2 py-1 dark:bg-dark-secondary"
                    >
                      Volver
                    </button>

                    <button
                      type="submit"
                      className="rounded-md bg-light-buttons px-2 py-1 dark:bg-dark-buttons"
                    >
                      Confirmar
                    </button>
                  </div>
                )}
                {!paymentMethod && (
                  <div className="flex justify-center gap-5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleBack(next);
                      }}
                      className="rounded-md bg-light-secondary px-2 py-1 dark:bg-dark-secondary"
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
