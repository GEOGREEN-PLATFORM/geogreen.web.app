declare global {
  interface ButtonOptions {
    designType?: "primary" | "secondary" | "tertiary";
    label?: string;
    loading?: boolean;
    show?: boolean;
  }
  interface UserAuthData {
    password: string;
    email: string;
  }
  interface UserRegisterData extends UserAuthData {
    repeatedPassword: string;
    firstName: string;
    lastName: string;
  }
  interface FilterItem {
    type: "select" | "date" | "date-range";
    key: string;
    label: string;
    selected: string | string[];
    data?: {
      name: string;
      value: string;
    }[];
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
    hasNested?: boolean;
    nestedItems?: {
      name: string;
      key: string;
      selected: boolean;
    }[];
  }
}

export {};
