import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// Importujemy Twój nowy komponent (Krok 9)
import MilitaryOSMLayer from "./MilitaryLayer";

export default function App() {
  // Współrzędne początkowe (środek Polski)
  const center: [number, number] = [52.069167, 19.480556];
  const zoom = 6;

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: "100vh", width: "100vw" }}
    >
      {/* Warstwa kafelków OpenStreetMap */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Wykorzystanie Twojego komponentu warstwy wojskowej */}
      <MilitaryOSMLayer />
      
    </MapContainer>
  );
}