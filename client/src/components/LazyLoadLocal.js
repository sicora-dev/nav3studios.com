import React, { useState, useEffect, memo } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';
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
          alt={`Foto del estudio ${index + 1}`}
          className="mx-auto mb-[1em]"
          delayMethod="debounce"
          delayTime={500}
          threshold={100}
          effect="blur"
          beforeLoad={() => {
            document.querySelectorAll('.lazy-load-image-background').forEach(el => {
              el.style.display = 'block';
              el.style.width = '100%';
              el.style.height = 'auto';
            });
          }}
        />
      ))}
    </div>
  );
});

export default LazyLoadLocal;
