import CAvatar from "@/components/CAvatar.vue";
import { mdiAccountOutline, mdiUpload } from "@quasar/extras/mdi-v6";
// tests/unit/CAvatar.spec.ts
import { mount, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Фэйковые функции
const openPhotoMock = vi.fn();
const getImageUrlMock = vi.fn((src: string) => `url-${src}`);

// Мокаем default‑экспорт usePhotoViewer
vi.mock("@/composables/usePhotoViewer", () => ({
  __esModule: true,
  default: () => ({ openPhoto: openPhotoMock }),
}));

// Мокаем default‑экспорт useFiles
vi.mock("@/composables/useFiles", () => ({
  __esModule: true,
  default: () => ({ getImageUrl: getImageUrlMock }),
}));

// Стаб QIcon
const QIconStub = {
  name: "q-icon",
  props: ["name", "color", "size"],
  template: "<i />",
};

describe("CAvatar (unit)", () => {
  beforeEach(() => {
    openPhotoMock.mockReset();
    getImageUrlMock.mockReset();
  });

  it("shows placeholder icon when no avatarSrc and editMode=false", () => {
    const wrapper = shallowMount(CAvatar, {
      global: { stubs: { "q-icon": QIconStub } },
      props: { editMode: false },
    });
    const icon = wrapper.findComponent(QIconStub);
    expect(icon.props("name")).toBe(mdiAccountOutline);
  });

  it("shows upload icon placeholder when editMode=true", () => {
    const wrapper = shallowMount(CAvatar, {
      global: { stubs: { "q-icon": QIconStub } },
      props: { editMode: true },
    });
    const icon = wrapper.findComponent(QIconStub);
    expect(icon.props("name")).toBe(mdiUpload);
    expect(wrapper.find(".c-avatar__item-overlay").exists()).toBe(true);
  });

  // it('sets localFileUrl from avatarSrc on mount', async () => {
  //   getImageUrlMock.mockReturnValue('url-abc')
  //   const wrapper = mount(CAvatar, {
  //     global: { stubs: { 'q-icon': QIconStub } },
  //     props: { avatarSrc: 'abc' }
  //   })
  //   // Ждём, пока onMounted выполнится и localFileUrl обновится
  //   await nextTick()

  //   const img = wrapper.find('img')
  //   expect(getImageUrlMock).toHaveBeenCalledWith('abc')
  //   expect(img.exists()).toBe(true)
  //   expect(img.attributes('src')).toBe('url-abc')
  // })

  it("updates localFileUrl and emits changeAvatar on file input change", async () => {
    const wrapper = mount(CAvatar, {
      global: { stubs: { "q-icon": QIconStub } },
      props: { editMode: true },
    });
    const file = new File([""], "f.png", { type: "image/png" });
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, "files", { value: [file] });
    await input.trigger("change");
    expect(wrapper.vm.localFileUrl).toContain("blob:");
    expect(wrapper.emitted("changeAvatar")![0]).toEqual([file]);
  });

  it("does not emit changeAvatar when no file selected", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const wrapper = mount(CAvatar, {
      global: { stubs: { "q-icon": QIconStub } },
      props: { editMode: true },
    });
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, "files", { value: [] });
    await input.trigger("change");
    expect(wrapper.emitted("changeAvatar")).toBeUndefined();
    consoleWarn.mockRestore();
  });

  it("clicking avatar triggers file upload when editMode=true", async () => {
    const wrapper = mount(CAvatar, {
      global: { stubs: { "q-icon": QIconStub } },
      props: { editMode: true },
    });
    const clickSpy = vi.spyOn(wrapper.vm.fileInput, "click");
    await wrapper.find(".c-avatar").trigger("click");
    expect(clickSpy).toHaveBeenCalled();
  });

  it("clicking image opens photo viewer", async () => {
    getImageUrlMock.mockReturnValue("url-xyz");
    const wrapper = mount(CAvatar, {
      global: { stubs: { "q-icon": QIconStub } },
      props: { avatarSrc: "xyz" },
    });
    // Ждём, пока картинка отрисуется
    await nextTick();

    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    await img.trigger("click");
    expect(openPhotoMock).toHaveBeenCalledWith("url-xyz");
  });

  it("watches avatarSrc and updates localFileUrl", async () => {
    getImageUrlMock.mockReturnValue("url-one");
    const wrapper = mount(CAvatar, {
      global: { stubs: { "q-icon": QIconStub } },
      props: { avatarSrc: "one" },
    });
    getImageUrlMock.mockReturnValue("url-new");
    await wrapper.setProps({ avatarSrc: "new" });
    expect(wrapper.find("img").attributes("src")).toBe("url-new");
    await wrapper.setProps({ avatarSrc: undefined });
    expect(wrapper.find("img").exists()).toBe(false);
  });
});
