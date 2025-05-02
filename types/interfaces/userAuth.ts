export interface UserAuthData {
  password: string;
  email: string;
}
export interface UserRegisterData extends UserAuthData {
  repeatedPassword: string;
  firstName: string;
  lastName: string;
}
