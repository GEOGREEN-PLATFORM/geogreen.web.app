import type { Coordinate } from "ol/coordinate";
declare global {
  interface ButtonOptions {
    designType?: "primary" | "secondary" | "tertiary";
    label?: string;
    loading?: boolean;
    show?: boolean;
  }
  interface User {
    role: "user" | "admin" | "operator";
    id: string;
    firstName: string;
    lastName: string;
    patronymic: string | null;
    email: string;
    number: string | null;
    birthdate: string | null;
    image: string | null;
    role: string;
    enabled: boolean;
    creationDate: string;
    password?: string;
  }
  interface OauthToken {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    refresh_token_expires_in: number;
    token_type: string;
  }
  interface ImageIds {
    previewImageId: string;
    fullImageId: string;
  }
  interface Alert {
    show: boolean;
    text: string;
    type?: "error" | "success" | "info";
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
    isTempCreatedBy?: string;
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
