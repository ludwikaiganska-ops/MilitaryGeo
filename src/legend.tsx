import "./Legend.css";

interface LegendProps {
  label: string;
  count: number;
}

export default function Legend({ label, count }: LegendProps) {
  return (
    <div className="legend-panel">
      <h4>Legenda</h4>
      <div className="legend-item"><strong>Typ:</strong> {label}</div>
      <div className="legend-item"><strong>Liczba obiektów:</strong> {count}</div>
    </div>
  );
}