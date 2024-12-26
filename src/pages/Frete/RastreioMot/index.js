import React from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";

const RastreamentoMotorista = () => {
  const containerStyle = {
    width: "100%",
    height: "600px",
  };

  const center = {
    lat: -25.4372, // Latitude de Curitiba
    lng: -49.2693, // Longitude de Curitiba
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyB9rnohWQ4xTuPSt3SBFe1o67jsDGKHiEw">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
      >
        {/* Conteúdo adicional do mapa (marcadores, etc.) pode ser adicionado aqui */}
      </GoogleMap>
    </LoadScript>
  );
};

export default RastreamentoMotorista;
