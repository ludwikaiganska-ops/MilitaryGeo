import { useEffect, useState, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";

// Importy Twoich nowych komponentów
import Legend from "./legend";
import StyleEditor from "./StyleEditor";
import ControlPanel from "./ControlPanel";

// ---- TYPY I STAŁE ----
type MilitaryType = "barracks" | "naval_base" | "airfield" | "training_area" | "range" | "danger_area" | "bunker";

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
  const [data, setData] = useState<any>(null);
  const [allData, setAllData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Stan stylu zintegrowany z GeoJSON (Zadanie 2)
  const [geoStyle, setGeoStyle] = useState({
    color: "#ff0000",
    weight: 6,
    opacity: 1
  });

  const layerRef = useRef<L.GeoJSON | null>(null);
  const map = useMap();

  // Pobieranie pojedynczej warstwy
  const fetchData = async (type: MilitaryType) => {
    setLoading(true); setData(null); setAllData([]);
    try {
      const result = await fetch(`/data/${type}.json`);
      const geojson = await result.json();
      setData(geojson);
    } catch (e) { console.error("Błąd ładowania"); }
    finally { setLoading(false); }
  };

  // Pobieranie wszystkich warstw naraz (Zadanie 3)
  const fetchAllData = async () => {
    setLoading(true); setData(null);
    setMilitaryType("all");
    try {
      const promises = MILITARY_TYPES.map(type => fetch(`/data/${type}.json`).then(res => res.json()));
      const results = await Promise.all(promises);
      setAllData(results);
    } catch (e) { console.error("Błąd ładowania wszystkich"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (militaryType !== "all") fetchData(militaryType);
  }, [militaryType]);

  // Automatyczne dopasowanie widoku
  useEffect(() => {
    if (!data || !layerRef.current) return;
    const bounds = layerRef.current.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { animate: true, padding: [20, 20] });
  }, [data, map]);

  return (
    <>
      {/* Górny panel z przyciskami (Zadanie 3 i 4) */}
      <ControlPanel 
        types={MILITARY_TYPES}
        labels={MILITARY_LABELS}
        activeType={militaryType}
        activeColor={geoStyle.color}
        onSelect={(t) => setMilitaryType(t)}
        onShowAll={fetchAllData}
      />

      {/* Warstwy GeoJSON zintegrowane ze stylem (Zadanie 2) */}
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

      {/* Legenda (Zadanie 1) */}
      <Legend 
        label={militaryType === "all" ? "Wszystkie" : MILITARY_LABELS[militaryType as MilitaryType]} 
        count={militaryType === "all" 
          ? allData.reduce((acc, curr) => acc + (curr.features?.length || 0), 0) 
          : (data?.features?.length || 0)} 
      />

      {/* Edytor stylu (Zadanie 2) */}
      <StyleEditor 
        color={geoStyle.color}
        weight={geoStyle.weight}
        opacity={geoStyle.opacity}
        onChange={(newVal) => setGeoStyle(prev => ({ ...prev, ...newVal }))} 
      />
    </>
  );
}