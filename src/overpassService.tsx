// overpassService.ts
import axios from "axios";
import osmtogeojson from "osmtogeojson";

export const fetchMilitaryData = async (type: string, countryCode: string = "PL") => {
  const query = `
    [out:json][timeout:60];
    area["ISO3166-1"="${countryCode}"]->.a;
    (
      way["military"="${type}"](area.a);
      relation["military"="${type}"](area.a);
      node["military"="${type}"](area.a);
    );
    out geom;
  `;

  const url = `https://overpass.kumi.systems/api/interpreter?data=${encodeURIComponent(query)}`;
  const response = await axios.get(url);
  return osmtogeojson(response.data) as GeoJSON.FeatureCollection;
};