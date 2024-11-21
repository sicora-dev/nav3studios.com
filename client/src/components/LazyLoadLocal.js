import React, { useState, useEffect, memo } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "../styles/galeria.css"; // Importa el archivo CSS

const LazyLoadLocal = memo(function LazyLoadLocal() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    /// Genera las rutas de las imágenes dinámicamente
    const imageList = [];
    for (let i = 1; i <= 10; i++) {
      imageList.push(`assets/${i}.webp`);
    }
    setImages(imageList);
  }, []);

  return (
    <div className="w-full columns-[400px] text-center">
      {images.map((src, index) => (
        <LazyLoadImage
          key={index}
          src={src}
          width={600}
          height={400}
          alt={`Foto ${index + 1}`}
          className="mx-auto mb-[1em]"
          delayTime={1000}
          placeholder={
            <img
              className="mb-[1em] h-full w-full"
              alt="Cargando..."
            ></img>
          }
        />
      ))}
    </div>
  );
});

export default LazyLoadLocal;
