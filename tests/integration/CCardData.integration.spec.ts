import CCard from "@/components/CCardData.vue";
import { mount } from "@vue/test-utils";
import { Quasar } from "quasar";
import { describe, expect, it } from "vitest";

// Реальная сборка Quasar + глобальная заглушка nuxt-link
const global = {
  plugins: [Quasar],
  stubs: {
    "nuxt-link": {
      props: ["to"],
      template: '<a :href="to"><slot/></a>',
    },
  },
};

describe("CCardContainer (integration)", () => {
  const items = [
    { label: "Name", value: "Bob", type: "text" },
    { label: "Docs", value: "Download", type: "link" },
    { label: "State", value: "Busy", type: "status" },
    { label: "X", value: "", type: "text" },
  ];
  const links = { Docs: "/docs" };
  const statusClasses = { Busy: "busy-class" };

  it("full render: text, link, status and empty", () => {
    const wrapper = mount(CCard, {
      global,
      props: {
        list: items,
        linksByLabel: links,
        statusClassesByValue: statusClasses,
      },
    });

    // текст
    expect(wrapper.text()).toContain("Name:");
    expect(wrapper.text()).toContain("Bob");
    // ссылка
    const link = wrapper.get('a[href="/docs"]');
    expect(link.text()).toBe("Download");
    // статус
    const status = wrapper.get(".c-card-items__value--status");
    expect(status.classes()).toContain("busy-class");
    expect(status.text()).toBe("Busy");
    // пустой
    expect(wrapper.find(".c-card-items__value--empty").exists()).toBe(true);
  });

  it("updates when props change", async () => {
    const wrapper = mount(CCard, {
      global,
      props: {
        list: [items[0]],
        linksByLabel: {},
        statusClassesByValue: {},
      },
    });
    // изначально только Bob
    expect(wrapper.text()).toContain("Bob");

    // меняем на Docs
    await wrapper.setProps({ list: [items[1]], linksByLabel: links });
    expect(wrapper.get("a").text()).toBe("Download");
  });
});
