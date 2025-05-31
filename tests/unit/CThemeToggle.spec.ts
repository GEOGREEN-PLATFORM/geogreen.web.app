import ThemeToggle from "@/components/CThemeToggle.vue";
// tests/unit/CThemeToggle.spec.ts
import { type VueWrapper, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";

// Мокаем внутреннее состояние
const darkIsActive = ref(false);
const toggleDarkMock = vi.fn(() => {
  darkIsActive.value = !darkIsActive.value;
  cookieRef.value = darkIsActive.value ? "dark" : "light";
});
const cookieRef = ref<"light" | "dark">("light");

// Мок useQuasar
vi.mock("quasar", () => ({
  useQuasar: () => ({
    dark: {
      get isActive() {
        return darkIsActive.value;
      },
      toggle: toggleDarkMock,
    },
  }),
}));

// Мок useCookie
vi.mock("#app", () => ({
  useCookie: () => cookieRef,
}));

describe("ThemeToggle (unit)", () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    darkIsActive.value = false;
    cookieRef.value = "light";
    toggleDarkMock.mockClear();
    wrapper = shallowMount(ThemeToggle);
  });

  it("рендерится в светлом режиме по умолчанию", () => {
    expect(wrapper.classes()).not.toContain("theme-toggle--dark");
  });

  it("переключается в тёмный режим по клику", async () => {
    await wrapper.trigger("click");
    // должен вызвать toggle()
    expect(toggleDarkMock).toHaveBeenCalledOnce();
    // кука обновилась сразу
    expect(cookieRef.value).toBe("dark");
    // а визуальный класс появится после nextTick
    await nextTick();
    expect(wrapper.classes()).toContain("theme-toggle--dark");
  });

  it("переключается обратно в светлый режим при повторном клике", async () => {
    // Включаем тёмный режим «извне»
    darkIsActive.value = true;
    cookieRef.value = "dark";
    await nextTick();
    expect(wrapper.classes()).toContain("theme-toggle--dark");

    await wrapper.trigger("click");
    expect(toggleDarkMock).toHaveBeenCalledOnce();
    // кука снова сразу «light»
    expect(cookieRef.value).toBe("light");
    await nextTick();
    console.log(wrapper.html());
    expect(wrapper.classes()).not.toContain("theme-toggle--dark");
  });

  it("правильно обновляет куку при каждом toggle", async () => {
    // 1-й клик → dark
    await wrapper.trigger("click");
    expect(cookieRef.value).toBe("dark");
    // 2-й клик → light
    await wrapper.trigger("click");
    expect(cookieRef.value).toBe("light");
  });
});
