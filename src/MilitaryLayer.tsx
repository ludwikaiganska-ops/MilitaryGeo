import { useEffect, useState, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import Legend from "./legend"; // <-- IMPORT KOMPONENTU

// (Typy i stałe MILITARY_TYPES / MILITARY_LABELS zostają bez zmian)
type MilitaryType = "barracks" | "naval_base" | "airfield" | "training_area" | "range" | "danger_area" | "bunker";
type GeoJSONData = GeoJSON.FeatureCollection;

const MILITARY_TYPES: MilitaryType[] = ["barracks", "naval_base", "airfield", "training_area", "range", "danger_area", "bunker"];
const MILITARY_LABELS: Record<MilitaryType, string> = {
  barracks: "Koszary", naval_base: "Baza morska", airfield: "Lotnisko wojskowe",
  training_area: "Obszar ćwiczeń", range: "Poligon", danger_area: "Strefa niebezpieczna", bunker: "Bunkier"
};

export default function MilitaryOSMLayer() {
  const [militaryType, setMilitaryType] = useState<MilitaryType>("barracks");
  const [data, setData] = useState<GeoJSONData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const layerRef = useRef<L.GeoJSON | null>(null);
  const map = useMap();

  const fetchData = async (type: MilitaryType) => {
    setLoading(true); setData(null); setError(null);
    try {
      const result = await fetch(`/data/${type}.json`);
      if (!result.ok) throw new Error(`Błąd: ${result.status}`);
      const geojson = await result.json();
      setData(geojson);
    } catch (error) {
      setError("Nie udało się załadować danych.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(militaryType); }, [militaryType]);

  useEffect(() => {
    if (!data || !layerRef.current) return;
    const bounds = layerRef.current.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { animate: true, padding: [20, 20] });
  }, [data, map]);

  return (
    <>
      {/* LOADER i BŁĄD zostają jak były (na razie) */}
      {loading && ( <div style={{ position: "fixed", zIndex: 99999 }}>Ładowanie...</div> )}
      {error && ( <div style={{ position: "absolute", zIndex: 10000 }}>{error}</div> )}

      {/* PANEL PRZYCISKÓW */}
      <div style={{ position: "absolute", top: "20px", left: "60px", zIndex: 999, background: "white", padding: "12px" }}>
        {MILITARY_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setMilitaryType(type)}
            style={{
              margin: "3px",
              background: type === militaryType ? "#1b5e20" : "#e0e0e0",
              color: type === militaryType ? "#fff" : "#000",
            }}
          >
            {MILITARY_LABELS[type]}
          </button>
        ))}
      </div>

      {/* WARSTWA GEOJSON */}
      {data && (
        <GeoJSON
          key={militaryType}
          data={data}
          ref={layerRef}
          style={() => ({
            color: "#c62828",
            weight: 3,
            opacity: 0.8,
            fillColor: "#ff5252",
            fillOpacity: 0.35,
          })}
        /> 
      )}

      {/* KROK 1: DODANIE LEGENDY DO WIDOKU */}
      <Legend 
        label={MILITARY_LABELS[militaryType]} 
        count={data?.features.length || 0} 
      />
    </>
  );
}