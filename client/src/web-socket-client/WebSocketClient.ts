import { PubSub } from "../pub-sub";
import { Response } from "./Response";
import { SerializableData } from "./SerializableData";

export class WebSocketClient {
    private nextRequestId = 1;
    private socket: WebSocket;

    public readonly isConnected: Promise<void>;

    private errorPubSub = new PubSub<Event>();
    public onError = this.errorPubSub.listen;

    private messagePubSub = new PubSub<Response>();
    public onMessage = this.messagePubSub.listen;

    public constructor({
        hostname,
        port,
    }: {
        hostname: string;
        port: string;
    }) {
        this.socket = new WebSocket(`ws://${hostname}:${port}`);

        this.socket.addEventListener("error", this.errorPubSub.publish);

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

            this.messagePubSub.publish(response);

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

    public async send(type: string, data?: SerializableData) {
        await this.isConnected;
        this.socket.send(
            JSON.stringify({
                type,
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
