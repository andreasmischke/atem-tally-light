import { parseJson } from "./gracefulJsonParser";

describe("gracefulJsonParser", () => {
  describe("parseJson", () => {
    it("should return parsed JSON for valid json string", () => {
      const json = parseJson('{"test": "foo"}');
      expect(json).toMatchObject({ test: "foo" });
    });

    it("should not fail when parsing invalid json", () => {
      const act = () => parseJson("this is not json");

      expect(act).not.toThrow();
    });

    it("should return undefined when parsing invalid json", () => {
      const json = parseJson("this is not json");

      expect(json).toBeUndefined();
    });
  });
});
