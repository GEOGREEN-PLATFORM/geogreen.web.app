import CCard from "@/components/CCardData.vue";
import { mount, shallowMount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

// Заглушки для Quasar компонентов и nuxt-link
const QCardStub = { template: "<div><slot/></div>" };
const QListStub = { template: "<ul><slot/></ul>" };
const QItemStub = { template: "<li><slot/></li>" };
const QItemSectionStub = { template: "<section><slot/></section>" };
const QItemLabelStub = { template: "<label><slot/></label>" };
const NuxtLinkStub = {
  props: ["to"],
  template: '<a :href="to"><slot/></a>',
};

describe("CCardContainer (unit)", () => {
  const baseProps = {
    list: [
      { label: "Name", value: "Alice", type: "text" },
      { label: "Profile", value: "View", type: "link" },
      { label: "Status", value: "Active", type: "status" },
      { label: "Missing", value: "", type: "text" },
    ],
    linksByLabel: { Profile: "/profile" },
    statusClassesByValue: { Active: "green-bg" },
  };

  const globalStubs = {
    "q-card": QCardStub,
    "q-list": QListStub,
    "q-item": QItemStub,
    "q-item-section": QItemSectionStub,
    "q-item-label": QItemLabelStub,
    "nuxt-link": NuxtLinkStub,
  };

  it("renders text items correctly", () => {
    const wrapper = shallowMount(CCard, {
      global: { stubs: globalStubs },
      props: baseProps,
    });
    const textItem = wrapper.find(".c-card-items__item .c-card-items__value");
    expect(textItem.exists()).toBe(true);
    expect(textItem.text()).toBe("Alice");
  });

  it("renders link items with correct href and text", () => {
    const wrapper = shallowMount(CCard, {
      global: { stubs: globalStubs },
      props: baseProps,
    });
    const link = wrapper.find(".c-card-items__value--link");
    expect(link.exists()).toBe(true);
    expect(link.attributes("href")).toBe("/profile");
    expect(link.text()).toBe("View");
  });

  it("renders status items with correct class and text", () => {
    const wrapper = shallowMount(CCard, {
      global: { stubs: globalStubs },
      props: baseProps,
    });
    const status = wrapper.find(".c-card-items__value--status");
    expect(status.exists()).toBe(true);
    expect(status.classes()).toContain("green-bg");
    expect(status.text()).toBe("Active");
  });

  it("renders empty placeholder when value is empty", () => {
    const wrapper = shallowMount(CCard, {
      global: { stubs: globalStubs },
      props: baseProps,
    });
    const empty = wrapper.findAll(".c-card-items__value--empty").at(0);
    expect(empty.exists()).toBe(true);
    expect(empty.text()).toBe("Нет данных");
  });

  it("renders card-footer slot", () => {
    const wrapper = mount(CCard, {
      global: { stubs: globalStubs },
      props: baseProps,
      slots: { "card-footer": '<div class="footer">FOOTER</div>' },
    });
    expect(wrapper.find(".footer").exists()).toBe(true);
    expect(wrapper.find(".footer").text()).toBe("FOOTER");
  });
});
