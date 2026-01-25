import { useEffect, useState, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import Legend from "./legend";
import StyleEditor from "./StyleEditor";
import "./MilitaryLayer.css"; 

// ---- TYPY (Naprawia błędy z obrazka) ----
type MilitaryType =
  | "barracks"
  | "naval_base"
  | "airfield"
  | "training_area"
  | "range"
  | "danger_area"
  | "bunker";

type GeoJSONData = GeoJSON.FeatureCollection;

// ---- STAŁE (Naprawia błędy z obrazka) ----
const MILITARY_TYPES: MilitaryType[] = [
  "barracks", "naval_base", "airfield", "training_area", "range", "danger_area", "bunker"
];

const MILITARY_LABELS: Record<MilitaryType, string> = {
  barracks: "Koszary",
  naval_base: "Baza morska",
  airfield: "Lotnisko wojskowe",
  training_area: "Obszar ćwiczeń",
  range: "Poligon",
  danger_area: "Strefa niebezpieczna",
  bunker: "Bunkier"
};

export default function MilitaryLayer() {
  const [militaryType, setMilitaryType] = useState<MilitaryType | "all">("barracks");
  const [data, setData] = useState<GeoJSONData | null>(null);
  const [allData, setAllData] = useState<GeoJSONData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Stan stylu (Zintegrowany z GeoJSON)
  const [geoStyle, setGeoStyle] = useState({
    color: "#ff0000",
    weight: 6,
    opacity: 1
  });

  const layerRef = useRef<L.GeoJSON | null>(null);
  const map = useMap();

  // Pobieranie pojedynczej warstwy
  const fetchData = async (type: MilitaryType) => {
    setLoading(true); setData(null); setAllData([]); setError(null);
    try {
      const result = await fetch(`/data/${type}.json`);
      if (!result.ok) throw new Error("Błąd sieci");
      const geojson = await result.json();
      setData(geojson);
    } catch (e) { setError("Błąd ładowania danych."); }
    finally { setLoading(false); }
  };

  // Pobieranie wszystkich warstw (Krok 3)
  const fetchAllData = async () => {
    setLoading(true); setData(null); setError(null);
    setMilitaryType("all");
    try {
      const promises = MILITARY_TYPES.map(type => fetch(`/data/${type}.json`).then(res => res.json()));
      const results = await Promise.all(promises);
      setAllData(results);
    } catch (e) { setError("Błąd ładowania wszystkich warstw."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (militaryType !== "all") fetchData(militaryType);
  }, [militaryType]);

  // Automatyczne przybliżanie do danych
  useEffect(() => {
    if (!data || !layerRef.current) return;
    const bounds = layerRef.current.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { animate: true, padding: [20, 20] });
  }, [data, map]);

  return (
    <>
      {/* Panel Górny */}
      <div className="top-panel">
  <div className="panel-title">Wywiad OSM:</div>
  {MILITARY_TYPES.map((type) => (
    <button
      key={type}
      className={`layer-button ${militaryType === type ? 'active' : ''}`}
      onClick={() => setMilitaryType(type)}
      // Dynamiczna zmiana koloru aktywnego przycisku
      style={militaryType === type ? { backgroundColor: geoStyle.color } : {}}
    >
      {MILITARY_LABELS[type]}
    </button>
  ))}
  
  <button 
    className={`layer-button all-layers ${militaryType === 'all' ? 'active-all' : ''}`}
    onClick={fetchAllData}
    // Dynamiczna zmiana koloru przycisku "Wszystkie"
    style={militaryType === 'all' ? { backgroundColor: geoStyle.color } : {}}
  >
    Pokaż wszystkie warstwy naraz
  </button>
</div>

      {/* Warstwy GeoJSON */}
      {militaryType === "all" ? (
        allData.map((layer, idx) => (
          <GeoJSON 
            key={`all-${idx}-${geoStyle.color}-${geoStyle.weight}`} 
            data={layer} 
            style={() => ({
              color: geoStyle.color,
              weight: geoStyle.weight,
              opacity: geoStyle.opacity,
              fillColor: geoStyle.color,
              fillOpacity: geoStyle.opacity * 0.3
            })} 
          />
        ))
      ) : (
        data && <GeoJSON 
          key={`${militaryType}-${geoStyle.color}-${geoStyle.weight}`} 
          data={data} 
          ref={layerRef}
          style={() => ({
            color: geoStyle.color,
            weight: geoStyle.weight,
            opacity: geoStyle.opacity,
            fillColor: geoStyle.color,
            fillOpacity: geoStyle.opacity * 0.3
          })} 
        />
      )}

      {/* Komponenty zewnętrzne */}
      <Legend 
        label={militaryType === "all" ? "Wszystkie" : MILITARY_LABELS[militaryType as MilitaryType]} 
        count={militaryType === "all" 
          ? allData.reduce((acc, curr) => acc + (curr.features?.length || 0), 0) 
          : (data?.features?.length || 0)} 
      />

      <StyleEditor 
        color={geoStyle.color}
        weight={geoStyle.weight}
        opacity={geoStyle.opacity}
        onChange={(newVal: any) => setGeoStyle(prev => ({ ...prev, ...newVal }))} 
      />
    </>
  );
}