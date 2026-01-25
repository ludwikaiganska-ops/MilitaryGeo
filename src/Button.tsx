import "./Button.css";

interface ButtonProps {
  label: string;
  isActive: boolean;
  activeColor?: string;
  onClick: () => void;
  className?: string;
}

export default function Button({ label, isActive, activeColor, onClick, className }: ButtonProps) {
  return (
    <button
      className={`custom-button ${className || ""} ${isActive ? "active" : ""}`}
      onClick={onClick}
      style={isActive ? { backgroundColor: activeColor } : {}}
    >
      {label}
    </button>
  );
}