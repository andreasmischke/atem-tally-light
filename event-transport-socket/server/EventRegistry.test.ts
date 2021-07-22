import { EventRegistry, EventValidator } from "./EventRegistry";
import { RawEvent } from "./eventValidation";

describe("EventRegistry", () => {
  describe("register", () => {
    it("should return this for chaining", () => {
      const registry = new EventRegistry();
      const returnValue = registry.register("", (p): p is RawEvent => true);

      expect(returnValue).toBe(registry);
    });
  });

  it("should not recognize unregistered events", async () => {
    const isKnownEvent = new EventRegistry().validateEvent({
      type: "random-event",
    });

    expect(isKnownEvent).toBe(false);
  });

  it("should return true if registered validator returns true", () => {
    const testEvent = {
      type: "test-event",
    };
    const registry = new EventRegistry().register(
      testEvent.type,
      (p: RawEvent): p is RawEvent => true
    );

    const isValidEvent = registry.validateEvent(testEvent);

    expect(isValidEvent).toBe(true);
  });

  it("should return false if registered validator returns false", () => {
    const testEvent = {
      type: "test-event",
    };
    const registry = new EventRegistry().register(
      testEvent.type,
      (p: RawEvent): p is RawEvent => false
    );

    const isValidEvent = registry.validateEvent(testEvent);

    expect(isValidEvent).toBe(false);
  });
});
