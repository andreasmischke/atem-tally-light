export interface EventHandler<T> {
    (arg: T): void | Promise<void>;
}
