// types.ts
export type MilitaryType =
  | "barracks"
  | "naval_base"
  | "airfield"
  | "training_area"
  | "range"
  | "danger_area"
  | "bunker";

export const MILITARY_TYPES: MilitaryType[] = [
  "barracks", "naval_base", "airfield", "training_area", "range", "danger_area", "bunker"
];

export const MILITARY_LABELS: Record<MilitaryType, string> = {
  barracks: "Koszary",
  naval_base: "Baza morska",
  airfield: "Lotnisko wojskowe",
  training_area: "Obszar ćwiczeń",
  range: "Poligon",
  danger_area: "Strefa niebezpieczna",
  bunker: "Bunkier"
};