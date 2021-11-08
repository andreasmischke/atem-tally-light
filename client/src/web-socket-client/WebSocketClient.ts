import EventEmitter from "eventemitter3";
import { Response } from "./Response";
import { SerializableData } from "./SerializableData";

type ErrorEventHandler = (error: Event) => void | Promise<void>;
type MessageEventHandler = (error: Response) => void | Promise<void>;

export class WebSocketClient {
    private nextRequestId = 1;
    private socket: WebSocket;

    public readonly isConnected: Promise<void>;

    private eventBus = new EventEmitter<{
        error: Event
        message: Response
    }>();
    public onError = (subscriber: ErrorEventHandler): VoidFunction => {
        this.eventBus.on('error', subscriber);
        return () => this.eventBus.off('error', subscriber);
    };

    public onMessage = (subscriber: MessageEventHandler): VoidFunction => {
        this.eventBus.on('message', subscriber);
        return () => this.eventBus.off('message', subscriber);
    };

    public constructor({
        hostname,
        port,
    }: {
        hostname: string;
        port: string;
    }) {
        this.socket = new WebSocket(`ws://${hostname}:${port}`);

        this.socket.addEventListener("error", (error) => this.eventBus.emit('error', error));

        this.isConnected = new Promise<void>((resolve) => {
            this.socket.addEventListener("open", () => resolve());
        });

        this.socket.addEventListener("message", ({ data: raw }) => {
            const { type, requestId, data } = JSON.parse(raw);

            const response = {
                type,
                requestId,
                data,
            };

            this.eventBus.emit('message', response);

            if (requestId) {
                console.info(
                    `received response of type ${type} for request#${requestId} with data`,
                    data
                );
            } else {
                console.info(
                    `received message of type ${type} with data`,
                    data
                );
            }
        });
    }

    public async send(event: string, data?: SerializableData) {
        await this.isConnected;
        this.socket.send(
            JSON.stringify({
                event,
                data,
            })
        );
    }

    public async request(type: string, data: SerializableData) {
        await this.isConnected;

        const requestId = this.nextRequestId++;

        return new Promise<Response>((resolve) => {
            const unsubscribe = this.onMessage((message) => {
                if (message.requestId === requestId) {
                    unsubscribe();
                    resolve(message);
                }
            });

            this.socket.send(
                JSON.stringify({
                    type,
                    requestId,
                    data,
                })
            );
        });
    }
}
