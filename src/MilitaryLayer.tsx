// ---- IMPORTY ----
import { useEffect, useState, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
//import axios from "axios";
//import osmtogeojson from "osmtogeojson";
import L from "leaflet"; // Importujemy Leaflet dla typowania ref

// ---- TYPY ----
// Uzupełnione o dodatkowe typy wojskowe (TODO)
type MilitaryType =
  | "barracks"
  | "naval_base"
  | "airfield"
  | "training_area"
  | "range"
  | "danger_area"
  | "bunker";

type GeoJSONData = GeoJSON.FeatureCollection;

// ---- LISTA TYPÓW ----
const MILITARY_TYPES: MilitaryType[] = [
  "barracks",
  "naval_base",
  "airfield",
  "training_area",
  "range",
  "danger_area",
  "bunker"
];

// ---- ETYKIETY (Tłumaczenia) ----
const MILITARY_LABELS: Record<MilitaryType, string> = {
  barracks: "Koszary",
  naval_base: "Baza morska",
  airfield: "Lotnisko wojskowe",
  training_area: "Obszar ćwiczeń",
  range: "Poligon",
  danger_area: "Strefa niebezpieczna",
  bunker: "Bunkier"
};

export default function MilitaryOSMLayer() {
  // Stan dla wybranego typu i danych (TODO: dodano typowanie)
  const [militaryType, setMilitaryType] = useState<MilitaryType>("barracks");
  const [data, setData] = useState<GeoJSONData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const layerRef = useRef<L.GeoJSON | null>(null);
  const map = useMap();

  // ---- FUNKCJA POBIERANIA DANYCH ----
  const fetchData = async (type: MilitaryType) => {
    setLoading(true); 
    setData(null);
    setError(null);

    const url = `/data/${type}.json`;
    
    try {
      const result = await fetch(url);
      
      if (!result.ok) {
        throw new Error(`Nie znaleziono pliku: ${url}`);
      }

      const geojson = await result.json();
      setData(geojson);
    } catch (error) {
      console.error("Błąd podczas pobierania danych:", error);
      setError("Nie udało się załadować danych lokalnych.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(militaryType);
  }, [militaryType]);

  // ---- DOPASOWANIE WIDOKU ----
  useEffect(() => {
    if (!data || !layerRef.current) return;
    const bounds = layerRef.current.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { animate: true, padding: [20, 20] });
    }
  }, [data, map]);

  return (
    <>
      {/* ---- LOADER ---- */}
      {loading && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.6)", zIndex: 99999, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: "24px", fontWeight: "bold"
        }}>
          <div>Ładowanie danych: {MILITARY_LABELS[militaryType]}...</div>
          <div style={{ fontSize: "14px", marginTop: "10px" }}>To może potrwać kilka sekund</div>
        </div>
      )}

      {/* ---- KOMUNIKAT BŁĘDU ---- */}
      {error && (
        <div style={{
          position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)",
          zIndex: 10000, background: "#ff5252", color: "white", padding: "10px 20px", borderRadius: "20px"
        }}>
          {error}
        </div>
      )}

      {/* ---- PANEL PRZYCISKÓW ---- */}
      <div style={{
        position: "absolute", top: "20px", left: "60px", // Przesunięte, by nie zasłaniać zoomu (TODO)
        zIndex: 9999, background: "rgba(255,255,255,0.9)", padding: "12px",
        borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.3)", maxWidth: "300px"
      }}>
        <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#333" }}>
          Wywiad geograficzny (OSM):
        </div>
        {MILITARY_TYPES.map((type) => (
          <button
            key={type}
            title={`Pobierz obiekty typu: ${type}`} // Tooltip (TODO)
            onClick={() => setMilitaryType(type)}
            style={{
              margin: "3px", padding: "8px 12px", borderRadius: "4px",
              border: "none", cursor: "pointer", fontSize: "12px",
              background: type === militaryType ? "#1b5e20" : "#e0e0e0",
              color: type === militaryType ? "#fff" : "#000",
              transition: "0.3s"
            }}
          >
            {MILITARY_LABELS[type] || type}
          </button>
        ))}
      </div>

      {/* ---- WARSTWA GEOJSON ---- */}
      {data && (
        <GeoJSON
          key={militaryType}
          data={data}
          ref={layerRef}
          style={() => ({
            color: "#c62828", // Ciemna czerwień wojskowa
            weight: 3,
            opacity: 0.8,
            fillColor: "#ff5252",
            fillOpacity: 0.35,
          })}
          onEachFeature={(feature, layer) => {
            // Dodajemy popup z informacją o nazwie obiektu
            if (feature.properties && feature.properties.name) {
              layer.bindPopup(`<strong>${feature.properties.name}</strong><br/>Typ: ${militaryType}`);
            }
          }}
        /> 
      )}
    </>
  );
}