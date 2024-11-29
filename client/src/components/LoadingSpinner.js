// components/LoadingSpinner.js
export default function LoadingSpinner() {
  return (
    <div className="p-5 text-center">
      <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-dashed border-light-buttons"></div>
      <h2 className="mt-4 text-light-text dark:text-dark-text">Cargando...</h2>
    </div>
  );
}
