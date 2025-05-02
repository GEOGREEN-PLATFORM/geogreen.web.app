export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  role: string;
  enabled: boolean;
  creationDate: string;
  email: string;
}

export interface EmployeesRequest extends ServerPagination {
  users: Employee[];
}
