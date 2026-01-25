import "./StyleEditor.css";

interface StyleEditorProps {
  color: string;
  weight: number;
  opacity: number;
  onChange: (newValues: any) => void;
}

export default function StyleEditor({ color, weight, opacity, onChange }: StyleEditorProps) {
  return (
    <div className="style-editor-container">
      <div className="style-editor-title">Styl warstwy</div>
      
      <div className="style-row">
        <label>Kolor:</label>
        <div className="color-input-wrapper">
          <input 
            type="color" 
            value={color} 
            onChange={(e) => onChange({ color: e.target.value })} 
          />
        </div>
      </div>

      <div className="style-row">
        <label>Grubość: {weight}</label>
        <input 
          type="range" min="1" max="15" 
          value={weight} 
          onChange={(e) => onChange({ weight: parseInt(e.target.value) })} 
        />
      </div>

      <div className="style-row">
        <label>Przezroczystość: {opacity}</label>
        <input 
          type="range" min="0" max="1" step="0.1" 
          value={opacity} 
          onChange={(e) => onChange({ opacity: parseFloat(e.target.value) })} 
        />
      </div>
    </div>
  );
}