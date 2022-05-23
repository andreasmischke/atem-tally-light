import { isRawEvent, SerializableData } from "./eventValidation";

describe("isRawEvent", () => {
  describe("should return false for invalid events", () => {
    it.each([null, undefined, {}, []])("%p", (event: any) => {
      const isValid = isRawEvent(event);

      expect(isValid).toBe(false);
    });
  });

  describe("should return true for event with valid type", () => {
    it.each(["", "non-empty"])("%p", (type: string) => {
      const isValid = isRawEvent({ type });

      expect(isValid).toBe(true);
    });
  });

  describe("should return false for event with invalid type", () => {
    it.each([1, null, undefined, false, true])(
      "%p",
      (type: any) => {
        const isValid = isRawEvent({ type });

        expect(isValid).toBe(false);
      }
    );
  });

  describe("should return true for event with valid data", () => {
    it.each([
      "",
      "any data",
      1,
      false,
      true,
      null,
      undefined,
      [],
      [false, true],
      [{}, false, [5, ""]],
      [""],
      ["string", 1, false],
      [[[[]]]],
      [{}, false, { with: "stuff" }],
      {},
    ])("%p", (data: SerializableData) => {
      const isValid = isRawEvent({ type: "", data });

      expect(isValid).toBe(true);
    });
  });

  describe("should return false for event with invalid data", () => {
    it.each([
      Symbol("sym"),
      () => {},
      function () {},
      [Symbol("sym")],
      [function () {}],
    ])("%p", (data: any) => {
      const isValid = isRawEvent({ type: "", data });

      expect(isValid).toBe(false);
    });
  });
});

// Type checks
