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
}

export {};
