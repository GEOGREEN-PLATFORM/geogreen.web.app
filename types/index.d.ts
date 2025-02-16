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
      density?: "default" | "low" | "medium" | "high";
    };
    relatedTaskId?: string | null;
    coordinates?: Coordinate[];
  }
  interface Tab {
    key: string;
    name: string;
    disabled?: boolean;
  }
}

export {};
