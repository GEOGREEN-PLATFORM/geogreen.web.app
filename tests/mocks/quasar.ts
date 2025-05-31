import { config } from "@vue/test-utils";
import { Dialog, Notify, Quasar } from "quasar";
import { vi } from "vitest";

// Мокаем глобальные плагины Quasar
export function setupQuasarMocks() {
  config.global.plugins = [[Quasar, { plugins: { Dialog, Notify } }]];

  // Мокаем глобальный объект `$q`
  config.global.mocks = {
    $q: {
      notify: vi.fn(),
      dialog: vi.fn(),
      screen: { gt: { sm: true } },
      dark: { isActive: false },
      lang: { getLocale: () => "ru-RU" },
    },
  };

  // Мокаем часто используемые компоненты Quasar (упрощённо)
  config.global.stubs = {
    QBtn: {
      template: "<button><slot /></button>",
      props: ["label", "icon", "noCaps"],
    },
    QSelect: {
      template: "<select><slot /></select>",
      props: ["modelValue", "options"],
      emits: ["update:modelValue"],
    },
    QInput: {
      template: "<input />",
      props: ["modelValue"],
      emits: ["update:modelValue"],
    },
    QIcon: {
      template: "<i />",
      props: ["name"],
    },
    QDate: true,
    QDialog: true,
    QMenu: true,
    QSlideTransition: true,
    QSeparator: true,
    QTooltip: true,
    QToggle: true,
    QCheckbox: true,
  };
}
