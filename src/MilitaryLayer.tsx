// ---- IMPORTY ----
import { useEffect, useState, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import Legend from "./legend"; // Import z Kroku 1
import StyleEditor from "./StyleEditor"; // Import z Kroku 2

// ---- TYPY ----
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

// ---- ETYKIETY ----
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
  const [militaryType, setMilitaryType] = useState<MilitaryType>("barracks");
  const [data, setData] = useState<GeoJSONData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- STAN STYLU (KROK 2) ---
  const [geoStyle, setGeoStyle] = useState({
    color: "#ff0000",
    weight: 6,
    opacity: 1
  });

  const layerRef = useRef<L.GeoJSON | null>(null);
  const map = useMap();

  // ---- POBIERANIE DANYCH ----
  const fetchData = async (type: MilitaryType) => {
    setLoading(true); 
    setData(null);
    setError(null);
    const url = `/data/${type}.json`;
    
    try {
      const result = await fetch(url);
      if (!result.ok) throw new Error(`Błąd: ${result.status}`);
      const geojson = await result.json();
      setData(geojson);
    } catch (error) {
      setError("Nie udało się załadować danych.");
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

      {/* ---- PANEL PRZYCISKÓW (Górny) ---- */}
      <div style={{
        position: "absolute", top: "20px", left: "60px",
        zIndex: 999, background: "rgba(255,255,255,0.9)", padding: "12px",
        borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
      }}>
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Wywiad OSM:</div>
        {MILITARY_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setMilitaryType(type)}
            style={{
              margin: "3px", padding: "8px 12px", borderRadius: "4px",
              border: "none", cursor: "pointer",
              background: type === militaryType ? "#1b5e20" : "#e0e0e0",
              color: type === militaryType ? "#fff" : "#000",
            }}
          >
            {MILITARY_LABELS[type]}
          </button>
        ))}
      </div>

      {/* ---- WARSTWA GEOJSON (Zintegrowana ze stylem) ---- */}
      {data && (
        <GeoJSON
          // Dynamiczny key wymusza przerysowanie przy zmianie suwaków
          key={`${militaryType}-${geoStyle.color}-${geoStyle.weight}-${geoStyle.opacity}`}
          data={data}
          ref={layerRef}
          style={() => ({
            color: geoStyle.color,
            weight: geoStyle.weight,
            opacity: geoStyle.opacity,
            fillColor: geoStyle.color,
            fillOpacity: geoStyle.opacity * 0.35,
          })}
          onEachFeature={(feature, layer) => {
            if (feature.properties && feature.properties.name) {
              layer.bindPopup(`<strong>${feature.properties.name}</strong><br/>Typ: ${militaryType}`);
            }
          }}
        /> 
      )}

      {/* ---- DODANE KOMPONENTY (KROK 1 i 2) ---- */}
      <Legend 
        label={MILITARY_LABELS[militaryType]} 
        count={data?.features.length || 0} 
      />

      <StyleEditor 
        color={geoStyle.color}
        weight={geoStyle.weight}
        opacity={geoStyle.opacity}
        onChange={(newVal) => setGeoStyle(prev => ({ ...prev, ...newVal }))}
      />
    </>
  );
}