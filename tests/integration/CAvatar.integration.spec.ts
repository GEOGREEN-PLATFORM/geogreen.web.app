import CAvatar from "@/components/CAvatar.vue";
import { mdiUpload } from "@quasar/extras/mdi-v6";
import { mount } from "@vue/test-utils";
import { Quasar } from "quasar";
import { describe, expect, it, vi } from "vitest";

// minimal Quasar stub
const global = {
  plugins: [Quasar],
  stubs: { "q-icon": true },
};

vi.mock("@/composables/useFiles", () => ({
  __esModule: true,
  default: () => ({
    getImageUrl: (src: string) => `test-url-${src}`,
  }),
}));

describe("CAvatar (integration)", () => {
  it("allows parent to react on changeAvatar event", async () => {
    const onChange = vi.fn();
    const Parent = {
      template: `<CAvatar editMode @changeAvatar="onChange"/>`,
      components: { CAvatar },
      setup() {
        return { onChange };
      },
    };
    const wrapper = mount(Parent, { global });
    const file = new File([""], "a.png", { type: "image/png" });
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, "files", { value: [file] });
    await input.trigger("change");
    expect(onChange).toHaveBeenCalledWith(file);
  });
  it("renders actual <img> when avatarSrc is provided", async () => {
    // Нам нужно контролировать getImageUrl, поэтому мокнем его через provide/inject
    const getImageUrl = (src: string) => `test-url-${src}`;
    const Parent = {
      template: `<CAvatar :avatarSrc="src" />`,
      components: { CAvatar },
      setup() {
        const src = "my-avatar.png";
        return { src };
      },
    };

    const wrapper = mount(Parent, {
      global: {
        plugins: [Quasar],
        stubs: { "q-icon": true },
        provide: {
          // если useFiles через provide/inject, или через глобальный плагин
          getImageUrl,
        },
      },
    });

    // Ждём onMounted и рендер
    await wrapper.vm.$nextTick();
    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("test-url-my-avatar.png");
  });
  it("renders placeholder and overlay in integration", () => {
    const wrapper = mount(CAvatar, { global, props: { editMode: true } });
    expect(wrapper.find(".c-avatar__item--placeholder").exists()).toBe(true);
    expect(wrapper.find(".c-avatar__item-overlay").exists()).toBe(true);
    expect(wrapper.find("q-icon-stub").attributes("name")).toBe(mdiUpload);
  });
});
