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
  const HOTBED_DENSITIES_OPTIONS: ItemOption[] = [
    { name: "Не известна", value: "default" },
    { name: "Низкая", value: "LOW" },
    { name: "Средняя", value: "MIDDLE" },
    { name: "Высокая", value: "HIGH" },
  ];

  const TASK_EVENT_STATUS_OPTIONS: ItemOption[] = [
    {
      name: "Создано",
      value: "Создано",
    },
    {
      name: "В работе",
      value: "В работе",
    },
    {
      name: "На проверке",
      value: "На проверке",
    },
    {
      name: "На паузе",
      value: "На паузе",
    },
    {
      name: "Отклонено",
      value: "Отклонено",
    },
    {
      name: "Выполнено",
      value: "Выполнено",
    },
  ];
  const TASK_EVENT_STATUS_STYLES = {
    Создано: "event-status created",
    "В работе": "event-status at-work",
    "На проверке": "event-status on-review",
    "На паузе": "event-status on-pause",
    Отклонено: "event-status rejected",
    Выполнено: "event-status completed",
  };
  return {
    EMPLOYEE_ACCOUNT_STATUS_OPTIONS,
    EMPLOYEE_ACCOUNT_STATUS_STYLES,
    EMPLOYEE_ROLE_OPTIONS,
    HOTBED_WORK_STAGE_STYLES,
    HOTBED_WORK_STAGE_OPTIONS,
    HOTBED_DENSITIES_OPTIONS,
    TASK_EVENT_STATUS_OPTIONS,
    TASK_EVENT_STATUS_STYLES,
  };
}
