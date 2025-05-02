import type { Coordinate } from "ol/coordinate";
export interface HotbedData {
  problemAreaType: string;
  landType: string;
  eliminationMethod: string;
  owner: string;
  contractingOrganization: string;
  comment: string;
  images: ImageObj[];
  density: Density;
  coordinate: Coordinate | null;
  coordinates: Coordinate[] | null;
}
