import Button from "./Button";
import "./ControlPanel.css";

interface ControlPanelProps {
  types: string[];
  labels: Record<string, string>;
  activeType: string;
  activeColor: string;
  onSelect: (type: any) => void;
  onShowAll: () => void;
}

export default function ControlPanel({ types, labels, activeType, activeColor, onSelect, onShowAll }: ControlPanelProps) {
  return (
    <div className="top-panel">
      <div className="panel-title">Wywiad OSM:</div>
      <div className="buttons-container">
        {types.map((type) => (
          <Button
            key={type}
            label={labels[type]}
            isActive={activeType === type}
            activeColor={activeColor}
            onClick={() => onSelect(type)}
          />
        ))}
        {/* Przycisk 'Wszystkie' jest teraz identycznie zdefiniowany co reszta */}
        <Button
          label="Pokaż wszystkie warstwy naraz"
          isActive={activeType === "all"}
          activeColor={activeColor}
          onClick={onShowAll}
        />
      </div>
    </div>
  );
}