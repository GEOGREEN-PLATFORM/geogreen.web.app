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
    id?: string;
    coordinate?: Coordinate;
    details: {
      square: number;
      owner?: string;
      landType?: string;
      contractingOrganization?: string;
      workStatus?: string;
      eliminationMethod?: string;
      photos?: string[];
      density?: Density;
    };
    relatedTaskId?: string | null;
    coordinates?: Coordinate[];
  }
  type Density = "default" | "low" | "medium" | "high";
  interface Tab {
    key: string;
    name: string;
    disabled?: boolean;
  }
}

export {};
