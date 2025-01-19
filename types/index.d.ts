declare global {
  interface ButtonOptions {
    designType: "primary" | "secondary" | "tertiary";
    label: string;
    loading?: boolean;
    show?: boolean;
  }
  interface UserAuthData {
    login: string;
    password: string;
    email?: string;
  }
  interface Marker {
    id: string;
    coordinates: Coordinate;
    details?: {
      square: number;
      owner?: string;
      landType?: string;
      contractingOrganization?: string;
      workStatus?: string;
      eliminationMethod?: string;
      photos?: string[];
    } | null;
    relatedTaskId?: string | null;
    relatedZone?: Zone | null;
  }
  interface Zone {
    coordinates: Coordinate[];
    density: 'low' | 'medium' | 'high';
  }
}

export {};
