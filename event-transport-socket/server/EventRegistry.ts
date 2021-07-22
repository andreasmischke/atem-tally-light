import { RawEvent } from "./eventValidation";

export type EventValidator<PacketType extends RawEvent = RawEvent> = (
  packet: RawEvent
) => packet is PacketType;

export class EventRegistry {
  #events = new Map<string, EventValidator>();

  register(eventType: string, validator: EventValidator) {
    this.#events.set(eventType, validator);

    return this
  }

  validateEvent(event: RawEvent): boolean {
    const validator = this.#events.get(event.type);

    if (validator === undefined) {
      return false;
    }

    return validator(event);
  }
}
