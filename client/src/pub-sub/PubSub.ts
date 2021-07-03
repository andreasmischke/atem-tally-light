import { EventHandler } from "./EventHandler";

export class PubSub<T> {
    private readonly subscribers = new Set<EventHandler<T>>();

    public listen = (subscriber: EventHandler<T>): VoidFunction => {
        this.subscribers.add(subscriber);

        return () => this.subscribers.delete(subscriber);
    };

    public publish = (data: T) => {
        this.subscribers.forEach((subscriber) =>
            new Promise(() => subscriber(data)).catch(() => {})
        );
    };
}
