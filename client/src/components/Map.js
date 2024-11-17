import React, { useState, useEffect, memo } from "react";
import { LoadScript, GoogleMap } from "@react-google-maps/api";

const MapComponent = memo(function MapComponent() {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [center] = useState({
    lat: 40.55392101971301,
    lng: -3.6155274027484015,
  });
  const [showDirections, setShowDirections] = useState(false);

  const markerPosition = { lat: 40.55392101971301, lng: -3.6155274027484015 };

  const markerStyle = `
    .marker-container {
      background-color: #EB5E28;
      padding: 12px 16px;
      color: white;
      font-family: 'Syne', sans-serif;
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transform-origin: bottom;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
    }

    .marker-container:after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid #EB5E28;
    }

    .marker-container:hover {
      transform: scale(1.1);
      background-color: #403D39;
    }

    .marker-container:hover:after {
      border-top-color: #403D39;
    }
  `;

  useEffect(() => {
    if (showDirections) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=40.4285,-3.6995`,
        "_blank",
      );
      setShowDirections(false);
    }

    const createMarker = async () => {
      if (!map || !window.google) return;
  
      try {
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary("marker");
  
        const markerView = document.createElement("div");
        const styleSheet = document.createElement("style");
        styleSheet.textContent = markerStyle;
        markerView.appendChild(styleSheet);
        
        markerView.innerHTML += `
          <div class="marker-container">
            <span>Nav3 Studios</span>
          </div>
        `;
  
        const advancedMarker = new AdvancedMarkerElement({
          map,
          position: markerPosition,
          title: "Nav3 Studios",
          content: markerView,
        });
  
        setMarker(advancedMarker);
      } catch (error) {
        console.error("Error al crear el marcador:", error);
      }
    };

    createMarker();
  }, [map, showDirections]);

  const handleLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const handleLoaded = () => {
    setIsLoaded(true);
  };

  const handleDirectionsClick = () => {
    const destination = encodeURIComponent("Avenida Somosierra 18");
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
      "_blank",
    );
  };

  return (
    <div className="relative h-96 w-full">
      {!isLoaded && (
        <img
          src="assets/mapa_nav3_onloading.webp"
          alt="Mapa localizacion del estudio"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        onLoad={handleLoaded}
        libraries={["marker"]}
      >
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={{ height: "100%", width: "100%" }}
            center={center}
            zoom={18}
            onLoad={handleLoad}
            mapId={process.env.REACT_APP_GOOGLE_MAPS_MAP_ID} // Add map ID here
            options={{
              mapId: process.env.REACT_APP_GOOGLE_MAPS_MAP_ID, // And here
              disableDefaultUI: true, // Optional: disable default UI
            }}
          />
        )}
      </LoadScript>
      <button
        className="align-center absolute bottom-1 left-1 w-fit bg-light-buttons p-3 dark:bg-dark-buttons"
        onClick={handleDirectionsClick}
      >
        Cómo llegar
      </button>
    </div>
  );
});

export default MapComponent;
