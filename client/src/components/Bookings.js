import { React, useEffect, useState, memo } from "react";
import axios from "axios";

const Bookings = memo(function Bookings({ bookingOption, bookings, producer }) {
  const [activeBooking, setActiveBooking] = useState(null);
  const [activeBookings, setActiveBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [historyBookings, setHistoryBookings] = useState([]);
  const [canceledBookings, setCanceledBookings] = useState([]);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showCancellationModal2, setShowCancellationModal2] = useState(false);
  const [cancellation_reason, setCancellationReason] = useState("");
  const [cancellationError, setCancellationError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(9);
  const [producersMap, setProducersMap] = useState({});
  const [servicesMap, setServicesMap] = useState({});

  useEffect(() => {
    if (!bookings) {
      console.warn("No bookings provided");
      return;
    }

    // Filter bookings based on status
    const active = bookings.filter((booking) => booking.status === "accepted");
    const pending = bookings.filter((booking) => booking.status === "pending");
    const canceled = bookings.filter(
      (booking) => booking.status === "canceled",
    );
    const history = bookings.filter(
      (booking) =>
        booking.status !== "pending" && booking.status !== "canceled",
    );

    setActiveBookings(active);
    setPendingBookings(pending);
    setCanceledBookings(canceled);
    setHistoryBookings(history);
  }, [bookings]);

  useEffect(() => {
    const fetchMappings = async () => {
      try {
        const [producersRes, servicesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/producers`),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/services`),
        ]);

        // Crear mapas para búsqueda O(1)
        const producersById = producersRes.data.reduce((acc, producer) => {
          acc[producer.id] = producer.username;
          return acc;
        }, {});

        const servicesById = servicesRes.data.reduce((acc, service) => {
          acc[service.id] = service.name;
          return acc;
        }, {});

        setProducersMap(producersById);
        setServicesMap(servicesById);
      } catch (error) {
        console.error("Error fetching mappings:", error);
      }
    };

    fetchMappings();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [bookingOption]);

  const handleActiveBooking = (id) => {
    if (activeBooking === id) {
      setActiveBooking(null);
    } else {
      setActiveBooking(id);
    }
  };

  const handleAccept = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/bookings/update/${activeBooking}`,
        {
          status: "accepted",
        },
        {
          withCredentials: true,
        },
      );
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const checkCancellationReason = (e) => {
    e.preventDefault();
    if (!cancellation_reason) {
      setCancellationError("El motivo de cancelación es requerido");
      return;
    }
    if (cancellation_reason.length < 10) {
      setCancellationError(
        "El motivo de cancelación debe tener al menos 10 caracteres",
      );
      return;
    }
    setShowCancellationModal(false);
    setShowCancellationModal2(true);
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/bookings/update/${activeBooking}`,
        {
          status: "canceled",
          reason: cancellation_reason,
        },
        {
          withCredentials: true,
        },
      );
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handlePaginate = (bookings) => {
    const lastIndex = currentPage * bookingsPerPage;
    const firstIndex = lastIndex - bookingsPerPage;

    return bookings.slice(firstIndex, lastIndex);
  };

  const getTotalPages = (bookings) => {
    return Math.ceil(bookings.length / bookingsPerPage);
  };

  const nextPage = () => {
    let totalPages;

    switch (bookingOption) {
      case "active":
        totalPages = getTotalPages(activeBookings);
        break;
      case "pending":
        totalPages = getTotalPages(pendingBookings);
        break;
      case "canceled":
        totalPages = getTotalPages(canceledBookings);
        break;
      case "history":
        totalPages = getTotalPages(historyBookings);
        break;
      default:
        totalPages = 1;
    }

    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const renderForm = () => {
    switch (bookingOption) {
      case "active":
        const paginatedActiveBookings = handlePaginate(activeBookings);
        const totalPagesActive = getTotalPages(activeBookings);
        return (
          <div className="flex w-full flex-col gap-2">
            {paginatedActiveBookings.map((booking) => (
              <label
                key={booking.id}
                id={booking.id}
                className={`group relative flex max-w-[300px] flex-col items-center justify-center gap-1 rounded-md border border-solid border-light-buttons/30 bg-light-secondary px-10 text-light-text duration-300 ease-in-out dark:bg-dark-secondary ${
                  activeBooking === booking.id ? "" : ""
                } dark:text-dark-text dark:shadow-dark-buttons/10`}
                htmlFor={booking.id}
                onClick={() => handleActiveBooking(booking.id)}
              >
                <input
                  id={booking.id}
                  name="path"
                  type="checkbox"
                  className="peer/expand hidden"
                />
                <div className="flex w-full items-center justify-center gap-2">
                  <h4>Reserva nº {booking.id}</h4>
                  <svg
                    className={`h-4 w-4 transition ease-in-out ${activeBooking === booking.id ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 8L12 16L20 8"
                      stroke={`${activeBooking === booking.id ? "#EB5E28" : "currentColor"}`}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div
                  className={`min-w-[170px] overflow-hidden transition-[max-height] duration-500 ease-in-out ${activeBooking === booking.id ? "max-h-[1200px]" : "max-h-0"}`}
                >
                  <p>
                    Fecha y hora:{" "}
                    {new Date(booking.booking_date).toLocaleString("es-ES", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "UTC",
                    })}
                  </p>
                  <p>
                    Servicio:{" "}
                    {servicesMap[booking.service_id] || booking.service_id}
                  </p>
                  <p>
                    Productor:{" "}
                    {producersMap[booking.producer_id] || booking.producer_id}
                  </p>
                  <p>Estado: {booking.status}</p>
                  {producer && (
                    <div className="my-2 flex gap-2">
                      <button
                        className="rounded-md bg-light-highlight/50 px-2 py-1 dark:bg-dark-highlight/50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCancellationError("");
                          setCancellationReason("");
                          setShowCancellationModal(true);
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </label>
            ))}
            {showCancellationModal && (
              <div
                className="fixed inset-0 z-40 flex items-center justify-center rounded-md bg-black bg-opacity-50"
                onClick={(e) => e.stopPropagation()}
              >
                <form className="absolute top-1/4 flex flex-col items-center gap-2 rounded-md bg-light-secondary p-5 dark:bg-dark-secondary">
                  <label htmlFor="cancellation_reason">
                    Motivo de cancelación
                  </label>
                  <input
                    className="rounded-md"
                    type="text"
                    name="cancellation_reason"
                    value={cancellation_reason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                  />
                  {cancellationError && (
                    <p className="text-red-700">{cancellationError}</p>
                  )}
                  <button
                    className="rounded-md bg-light-highlight px-2 py-1 dark:bg-dark-highlight"
                    onClick={(e) => {
                      checkCancellationReason(e);
                    }}
                  >
                    Confirmar
                  </button>
                  <button
                    className="rounded-md bg-light-buttons px-2 py-1"
                    onClick={() => setShowCancellationModal(false)}
                  >
                    Mantener
                  </button>
                </form>
              </div>
            )}
            {showCancellationModal2 && (
              <div
                className="fixed inset-0 z-40 flex items-center justify-center rounded-md bg-black bg-opacity-50"
                onClick={(e) => e.stopPropagation()}
              >
                <form className="absolute top-1/4 flex flex-col items-center gap-2 rounded-md bg-light-secondary p-5 dark:bg-dark-secondary">
                  <label
                    className="flex flex-col text-center"
                    htmlFor="cancellation_reason"
                  >
                    <p className="justify-center">
                      <span className="text-light-buttons">ATENCIÓN</span>, vas
                      a cancelar una reserva.
                    </p>
                    <p className="text-light-buttons">
                      ESTA ACCIÓN ES IRREVERSIBLE.
                    </p>
                    <p>¿Estás seguro de que quieres cancelarla?</p>
                  </label>
                  <p>Motivo: {cancellation_reason}</p>
                  <div className="flex gap-5">
                    <button
                      className="rounded-md bg-light-highlight px-2 py-1 dark:bg-dark-highlight"
                      onClick={(e) => handleCancel(e)}
                    >
                      Confirmar
                    </button>
                    <button
                      className="rounded-md bg-light-buttons px-2 py-1"
                      onClick={() => {
                        setShowCancellationModal2(false);
                        setShowCancellationModal(false);
                      }}
                    >
                      Mantener
                    </button>
                  </div>
                </form>
              </div>
            )}
            <div className="flex w-full justify-end gap-5">
              <button onClick={prevPage} title="Anterior">
                <svg
                  className={`h-5 w-5 transition ease-in-out`}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 20L7 12L15 4"
                    stroke="#EB5E28"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <div className="">
                {currentPage} / {totalPagesActive}
              </div>
              <button onClick={nextPage} title="Siguiente">
                <svg
                  className={`h-5 w-5 transition ease-in-out`}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 20L17 12L9 4"
                    stroke="#EB5E28"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      case "pending":
        const paginatedPendingBookings = handlePaginate(pendingBookings);
        const totalPagesPending = getTotalPages(pendingBookings);
        return (
          <div className="flex w-full flex-col gap-2">
            {paginatedPendingBookings.map((booking) => (
              <label
                key={booking.id}
                id={booking.id}
                className={`group relative flex max-w-[300px] flex-col items-center justify-center gap-1 rounded-md border border-solid border-light-buttons/30 bg-light-secondary px-10 text-light-text duration-300 ease-in-out dark:bg-dark-secondary ${
                  activeBooking === booking.id ? "" : ""
                } dark:text-dark-text dark:shadow-dark-buttons/10`}
                htmlFor={booking.id}
                onClick={() => handleActiveBooking(booking.id)}
              >
                <input
                  id={booking.id}
                  name="path"
                  type="checkbox"
                  className="peer/expand hidden"
                />
                <div className="flex w-full items-center justify-center gap-2">
                  <h4>Reserva nº {booking.id}</h4>
                  <svg
                    className={`h-4 w-4 transition ease-in-out ${activeBooking === booking.id ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 8L12 16L20 8"
                      stroke={`${activeBooking === booking.id ? "#EB5E28" : "currentColor"}`}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div
                  className={`min-w-[170px] overflow-hidden transition-[max-height] duration-500 ease-in-out ${activeBooking === booking.id ? "max-h-[1200px]" : "max-h-0"}`}
                >
                  <p>
                    Fecha y hora:{" "}
                    {new Date(booking.booking_date).toLocaleString("es-ES", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "UTC",
                    })}
                  </p>
                  <p>
                    Servicio:{" "}
                    {servicesMap[booking.service_id] || booking.service_id}
                  </p>
                  <p>
                    Productor:{" "}
                    {producersMap[booking.producer_id] || booking.producer_id}
                  </p>
                  <p>Estado: {booking.status}</p>
                  {producer && (
                    <div className="my-2 flex gap-2">
                      <button
                        className="rounded-md bg-light-buttons px-2 py-1"
                        onClick={handleAccept}
                      >
                        Aceptar
                      </button>
                      <button
                        className="rounded-md bg-light-highlight/50 px-2 py-1 dark:bg-dark-highlight/50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCancellationError("");
                          setCancellationReason("");
                          setShowCancellationModal(true);
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </label>
            ))}
            {showCancellationModal && (
              <div
                className="fixed inset-0 z-40 flex items-center justify-center rounded-md bg-black bg-opacity-50"
                onClick={(e) => e.stopPropagation()}
              >
                <form className="absolute top-1/4 flex flex-col items-center gap-2 rounded-md bg-light-secondary p-5 dark:bg-dark-secondary">
                  <label htmlFor="cancellation_reason">
                    Motivo de cancelación
                  </label>
                  <input
                    type="text"
                    name="cancellation_reason"
                    value={cancellation_reason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                  />
                  {cancellationError && (
                    <p className="text-red-700">{cancellationError}</p>
                  )}
                  <button
                    className="rounded-md bg-light-highlight px-2 py-1 dark:bg-dark-highlight"
                    onClick={(e) => {
                      checkCancellationReason(e);
                    }}
                  >
                    Confirmar
                  </button>
                  <button
                    className="rounded-md bg-light-buttons px-2 py-1"
                    onClick={() => setShowCancellationModal(false)}
                  >
                    Mantener
                  </button>
                </form>
              </div>
            )}
            {showCancellationModal2 && (
              <div
                className="fixed inset-0 z-40 flex items-center justify-center rounded-md bg-black bg-opacity-50"
                onClick={(e) => e.stopPropagation()}
              >
                <form className="absolute top-1/4 flex flex-col items-center gap-2 rounded-md bg-light-secondary p-5 dark:bg-dark-secondary">
                  <label
                    className="flex flex-col text-center"
                    htmlFor="cancellation_reason"
                  >
                    <p className="justify-center">
                      <span className="text-light-buttons">ATENCIÓN</span>, vas
                      a cancelar una reserva.
                    </p>
                    <p className="text-light-buttons">
                      ESTA ACCIÓN ES IRREVERSIBLE.
                    </p>
                    <p>¿Estás seguro de que quieres cancelarla?</p>
                  </label>
                  <p>Motivo: {cancellation_reason}</p>
                  <div className="flex gap-5">
                    <button
                      className="rounded-md bg-light-highlight px-2 py-1 dark:bg-dark-highlight"
                      onClick={(e) => handleCancel(e)}
                    >
                      Confirmar
                    </button>
                    <button
                      className="rounded-md bg-light-buttons px-2 py-1"
                      onClick={() => {
                        setShowCancellationModal2(false);
                        setShowCancellationModal(false);
                      }}
                    >
                      Mantener
                    </button>
                  </div>
                </form>
              </div>
            )}
            <div className="flex w-full justify-end gap-5">
              <button onClick={prevPage} title="Anterior">
                <svg
                  className={`h-5 w-5 transition ease-in-out`}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 20L7 12L15 4"
                    stroke="#EB5E28"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <div className="">
                {currentPage} / {totalPagesPending}
              </div>
              <button onClick={nextPage} title="Siguiente">
                <svg
                  className={`h-5 w-5 transition ease-in-out`}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 20L17 12L9 4"
                    stroke="#EB5E28"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      case "history":
        const paginatedHistoryBookings = handlePaginate(historyBookings);
        const totalPagesHistory = getTotalPages(historyBookings);
        return (
          <div className="flex w-full flex-col gap-2">
            {paginatedHistoryBookings.map((booking) => (
              <label
                key={booking.id}
                id={booking.id}
                className={`group relative flex max-w-[300px] flex-col items-center justify-center gap-1 rounded-md border border-solid border-light-buttons/30 bg-light-secondary px-10 text-light-text duration-300 ease-in-out dark:bg-dark-secondary ${
                  activeBooking === booking.id ? "" : ""
                } dark:text-dark-text dark:shadow-dark-buttons/10`}
                htmlFor={booking.id}
                onClick={() => handleActiveBooking(booking.id)}
              >
                <input
                  id={booking.id}
                  name="path"
                  type="checkbox"
                  className="peer/expand hidden"
                />
                <div className="flex w-full items-center justify-center gap-2">
                  <h4>Reserva nº {booking.id}</h4>
                  <svg
                    className={`h-4 w-4 transition ease-in-out ${activeBooking === booking.id ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 8L12 16L20 8"
                      stroke={`${activeBooking === booking.id ? "#EB5E28" : "currentColor"}`}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div
                  className={`min-w-[170px] overflow-hidden transition-[max-height] duration-500 ease-in-out ${activeBooking === booking.id ? "max-h-[1200px]" : "max-h-0"}`}
                >
                  <p>
                    Fecha y hora:{" "}
                    {new Date(booking.booking_date).toLocaleString("es-ES", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "UTC",
                    })}
                  </p>
                  <p>
                    Servicio:{" "}
                    {servicesMap[booking.service_id] || booking.service_id}
                  </p>
                  <p>
                    Productor:{" "}
                    {producersMap[booking.producer_id] || booking.producer_id}
                  </p>
                  <p>Estado: {booking.status}</p>
                </div>
              </label>
            ))}
            <div className="flex w-full justify-end gap-5">
              <button onClick={prevPage} title="Anterior">
                <svg
                  className={`h-5 w-5 transition ease-in-out`}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 20L7 12L15 4"
                    stroke="#EB5E28"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <div className="">
                {currentPage} / {totalPagesHistory}
              </div>
              <button onClick={nextPage} title="Siguiente">
                <svg
                  className={`h-5 w-5 transition ease-in-out`}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 20L17 12L9 4"
                    stroke="#EB5E28"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      case "canceled":
        const paginatedCanceledBookings = handlePaginate(canceledBookings);
        const totalPagesCanceled = getTotalPages(canceledBookings);
        return (
          <div className="flex w-full flex-col gap-2">
            {paginatedCanceledBookings.map((booking) => (
              <label
                key={booking.id}
                id={booking.id}
                className={`group relative flex max-w-[300px] flex-col items-center justify-center gap-1 rounded-md border border-solid border-light-buttons/30 bg-light-secondary px-10 text-light-text duration-300 ease-in-out dark:bg-dark-secondary ${
                  activeBooking === booking.id ? "" : ""
                } dark:text-dark-text dark:shadow-dark-buttons/10`}
                htmlFor={booking.id}
                onClick={() => handleActiveBooking(booking.id)}
              >
                <input
                  id={booking.id}
                  name="path"
                  type="checkbox"
                  className="peer/expand hidden"
                />
                <div className="flex w-full items-center justify-center gap-2">
                  <h4>Reserva nº {booking.id}</h4>
                  <svg
                    className={`h-4 w-4 transition ease-in-out ${activeBooking === booking.id ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 8L12 16L20 8"
                      stroke={`${activeBooking === booking.id ? "#EB5E28" : "currentColor"}`}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div
                  className={`min-w-[170px] overflow-hidden transition-[max-height] duration-500 ease-in-out ${activeBooking === booking.id ? "max-h-[1200px]" : "max-h-0"}`}
                >
                  <p>
                    Fecha y hora:{" "}
                    {new Date(booking.booking_date).toLocaleString("es-ES", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "UTC",
                    })}
                  </p>
                  <p>
                    Servicio:{" "}
                    {servicesMap[booking.service_id] || booking.service_id}
                  </p>
                  <p>
                    Productor:{" "}
                    {producersMap[booking.producer_id] || booking.producer_id}
                  </p>
                  <p>Estado: {booking.status}</p>
                </div>
              </label>
            ))}
            <div className="flex w-full justify-end gap-5">
              <button onClick={prevPage} title="Anterior">
                <svg
                  className={`h-5 w-5 transition ease-in-out`}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 20L7 12L15 4"
                    stroke="#EB5E28"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <div className="">
                {currentPage} / {totalPagesCanceled}
              </div>
              <button onClick={nextPage} title="Siguiente">
                <svg
                  className={`h-5 w-5 transition ease-in-out`}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 20L17 12L9 4"
                    stroke="#EB5E28"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      default:
        return <h2>Seleccione una opción</h2>;
    }
  };

  return (
    <div className="flex flex-col items-center px-2 py-5">{renderForm()}</div>
  );
});

export default Bookings;
