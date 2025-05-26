import type { Coordinate } from "ol/coordinate";
declare global {
  interface ButtonOptions {
    designType?: "primary" | "secondary" | "tertiary";
    label?: string;
    loading?: boolean;
    show?: boolean;
  }
  interface ItemOption {
    name: string;
    value: string | number;
  }
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
  interface TableHeader {
    name: string;
    label: string;
    align?: "left" | "right" | "center" | undefined;
    sortable?: boolean;
    field: string | ((row: unknown) => unknown);
  }
  interface TableRow {
    [fieldName: string]: string | number | undefined | null;
  }
  interface TablePagination {
    rowsPerPage: number;
    page: number;
    rowsNumber?: number;
    sortBy?: string | null;
    descending?: boolean;
  }
  interface ServerPagination {
    currentPage: number;
    totalItems: number;
    totalPages: number;
  }
  interface CardItem {
    label: string;
    value?: string;
    type: "text" | "link" | "status";
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
    image: ImageObj | null;
    role: string;
    enabled: boolean;
    creationDate: string;
    isEmailVerified?: boolean;
    password?: string;
  }
  interface ImageObj {
    fullImageId: string;
    previewImageId: string;
  }
  interface OauthToken {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    refresh_token_expires_in: number;
    token_type: string;
  }
  interface Alert {
    show: boolean;
    text: string;
    type?: "error" | "success" | "info";
  }
  type FilterItem = {
    key: string;
    label: string;
    disabled?: boolean;
  } & (FilterDateRange | FilterSelect | FilterText);
  type FilterText = {
    type: "text";
    selected: string;
  };
  type FilterSelect = {
    type: "select";
    selected: string;
    data: ItemOption[];
    useInput?: boolean;
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
    id: string;
    coordinate: Coordinate;
    details: {
      square: number;
      owner: string;
      landType: string;
      contractingOrganization: string;
      problemAreaType: string;
      workStage: string;
      images: ImageObj[];
      comment: string;
      eliminationMethod: string;
      density: Density;
      creationDate?: string;
      updateDate?: string;
    };
    relatedTaskId: string | null;
    coordinates: Coordinate[] | null;
    isTempCreatedBy?: string;
  }
  interface MapPopupShortInfoKeys {
    [key: string]: {
      name: string;
      type: "images" | "text" | "status";
    };
  }
  interface ZoneWithDensity {
    density: Density;
    coordinates: Coordinate[];
  }
  type Density = null | "default" | "LOW" | "MIDDLE" | "HIGH";
}
