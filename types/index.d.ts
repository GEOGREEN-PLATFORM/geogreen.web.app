declare global {
  interface ButtonOptions {
    designType?: "primary" | "secondary" | "tertiary";
    label?: string;
    loading?: boolean;
    show?: boolean;
  }
  interface Alert {
    show: boolean;
    text: string;
    type?: "error" | "success";
  }
  interface UserAuthData {
    password: string;
    email: string;
  }
  type ProblemAreaTypes = "Борщевик" | "Пожар" | "Свалка";
  interface UserRegisterData extends UserAuthData {
    repeatedPassword: string;
    firstName: string;
    lastName: string;
  }
  type FilterItem = {
    key: string;
    label: string;
  } & (FilterDateRange | FilterSelect | FilterText);
  type FilterText = {
    type: "text";
    selected: string;
  };
  type FilterSelect = {
    type: "select";
    selected: string;
    data: {
      name: string;
      value: string;
    }[];
  };
  type FilterDateRange = {
    type: "date-range";
    selected: DateRange | string;
  };
  type DateRange = {
    from: string;
    to: string;
  };
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
    userTempCreated?: true;
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
