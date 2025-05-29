import CTable from "@/components/CTable/Index.vue";
import { shallowMount } from "@vue/test-utils";

describe("CTable.vue", () => {
  it("renders the table component", () => {
    const wrapper = shallowMount(CTable);
    expect(wrapper.exists()).toBe(true);
  });

  it("renders rows when passed as props", () => {
    const rows = [
      { id: 1, name: "Row 1" },
      { id: 2, name: "Row 2" },
    ];
    const wrapper = shallowMount(CTable, {
      props: { rows },
    });
    expect(wrapper.props().rows).toEqual(rows);
  });
});
