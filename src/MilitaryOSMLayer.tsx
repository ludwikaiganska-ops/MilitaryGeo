import { useEffect, useState, useRef } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import { type MilitaryType, MILITARY_TYPES, MILITARY_LABELS } from "./types";
import { fetchMilitaryData } from "./overpassService";

export default function MilitaryOSMLayer() {
  const [militaryType, setMilitaryType] = useState<MilitaryType>("barracks");
  const [data, setData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const layerRef = useRef<L.GeoJSON | null>(null);
  const map = useMap();

  // Efekt ładowania danych
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const geojson = await fetchMilitaryData(militaryType);
        if (isMounted) setData(geojson);
      } catch (e) {
        if (isMounted) setError("Błąd pobierania danych wojskowych.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; }; // Cleanup, by uniknąć wycieków pamięci
  }, [militaryType]);

  // Efekt dopasowania kamery
  useEffect(() => {
    if (data && layerRef.current) {
      const bounds = layerRef.current.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { animate: true, padding: [20, 20] });
      }
    }
  }, [data, map]);

  return (
    <>
      {loading && <LoadingOverlay label={MILITARY_LABELS[militaryType]} />}
      {error && <ErrorBox message={error} />}
      
      <div className="control-panel" style={panelStyle}>
        <h4 style={{ margin: "0 0 8px 0" }}>Wywiad geograficzny (OSM):</h4>
        {MILITARY_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setMilitaryType(type)}
            style={getButtonStyle(type === militaryType)}
          >
            {MILITARY_LABELS[type]}
          </button>
        ))}
      </div>

      {data && (
        <GeoJSON
          key={militaryType}
          data={data}
          ref={layerRef}
          style={geoJsonStyle}
          onEachFeature={(feature, layer) => {
            const name = feature.properties?.name || "Obiekt bezimienny";
            layer.bindPopup(`<strong>${name}</strong><br/>Typ: ${MILITARY_LABELS[militaryType]}`);
          }}
        />
      )}
    </>
  );
}

// --- Style i Mini-komponenty pomocnicze ---

const panelStyle: React.CSSProperties = {
  position: "absolute", top: "20px", left: "60px", zIndex: 9999,
  background: "white", padding: "12px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
};

const getButtonStyle = (isActive: boolean): React.CSSProperties => ({
  margin: "3px", padding: "8px 12px", borderRadius: "4px", border: "none", cursor: "pointer",
  background: isActive ? "#1b5e20" : "#e0e0e0", color: isActive ? "#fff" : "#000"
});

const geoJsonStyle = {
  color: "#c62828", weight: 3, opacity: 0.8, fillColor: "#ff5252", fillOpacity: 0.35
};

function LoadingOverlay({ label }: { label: string }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white" }}>
      <div>Ładowanie: {label}...</div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)", zIndex: 10000, background: "#ff5252", color: "white", padding: "10px 20px", borderRadius: "20px" }}>
      {message}
    </div>
  );
}