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
  const EMPLOYEE_ACCOUNT_STATUS_STYLES = {
    active: "account-state active",
    blocked: "account-state blocked",
  };
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
  const HOTBED_WORK_STAGE_OPTIONS: ItemOption[] = [
    {
      name: "Создано",
      value: "Создано",
    },
    {
      name: "В работе",
      value: "В работе",
    },
    {
      name: "Завершено",
      value: "Завершено",
    },
  ];
  const HOTBED_WORK_STAGE_STYLES = {
    Создано: "work-stage created",
    "В работе": "work-stage working",
    Завершено: "work-stage completed",
  };
  const HOTBED_DENSITIES_OPTIONS = [
    { name: "Низкая", value: "low" },
    { name: "Средняя", value: "medium" },
    { name: "Высокая", value: "high" },
  ];
  return {
    EMPLOYEE_ACCOUNT_STATUS_OPTIONS,
    EMPLOYEE_ACCOUNT_STATUS_STYLES,
    EMPLOYEE_ROLE_OPTIONS,
    HOTBED_WORK_STAGE_STYLES,
    HOTBED_WORK_STAGE_OPTIONS,
    HOTBED_DENSITIES_OPTIONS,
  };
}
