import useRules from "@/composables/useRules";
import { describe, expect, it } from "vitest";

describe("useRules composable", () => {
  const { validateEmail, validatePassword } = useRules();

  it("validates email: empty", () => {
    expect(validateEmail("")).toBe("Не может быть пустым");
  });
  it("validates email: invalid", () => {
    expect(validateEmail("invalid")).toBe("Неверный формат почты");
  });
  it("validates email: valid", () => {
    expect(validateEmail("test@example.com")).toBe(true);
  });

  it("validates password: empty", () => {
    expect(validatePassword("")).toBe("Не может быть пустым");
  });
  it("validates password: too short", () => {
    expect(validatePassword("123")).toBe("От 8 до 20 символов");
  });
  it("validates password: valid", () => {
    expect(validatePassword("12345678")).toBe(true);
    expect(validatePassword("12345678901234567890")).toBe(true);
  });
  it("validates password: too long", () => {
    expect(validatePassword("123456789012345678901")).toBe(
      "От 8 до 20 символов",
    );
  });
});
