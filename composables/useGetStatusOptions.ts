export default function useGetStatusOptions() {
  const EMPLOYEE_ACCOUNT_STATUS_OPTIONS: ItemOption[] = [
    {
      name: "Активен",
      value: "active",
    },
    {
      name: "Заблокирован",
      value: "blocked",
    },
  ];
  const EMPLOYEE_ROLE_OPTIONS: ItemOption[] = [
    {
      name: "Оператор",
      value: "operator",
    },
    {
      name: "Администратор",
      value: "admin",
    },
  ];
  const HOTBED_WORK_STAGE_STYLES = {
    Создано: "work-stage created",
    "В работе": "work-stage working",
    Завершено: "work-stage completed",
  };
  return {
    EMPLOYEE_ACCOUNT_STATUS_OPTIONS,
    EMPLOYEE_ROLE_OPTIONS,
    HOTBED_WORK_STAGE_STYLES,
  };
}
