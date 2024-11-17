// components/LoadingSpinner.js
export default function LoadingSpinner() {
  return (
    <div class="p-5 text-center">
      <div class="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-dashed border-light-buttons"></div>
      <h2 class="mt-4 text-light-text dark:text-dark-text">Cargando...</h2>
    </div>
  );
}
