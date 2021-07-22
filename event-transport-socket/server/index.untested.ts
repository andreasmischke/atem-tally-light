import EventEmitter from "eventemitter3";
import http from "http";
import WebSocket from "ws";
import { EventRegistry } from "./server/EventRegistry";
import { parseJson } from "./server/gracefulJsonParser";
import { isRawEvent } from "./server/eventValidation";

export interface Logger {
  debug(...args: any[]): void;
  info(...args: any[]): void;
  error(...args: any[]): void;
}

export class EventTransportWebsocketServer {
  #logger: Logger;
  #wss: WebSocket.Server;
  #sockets = new Set<WebSocket>();
  #eventRegistry: EventRegistry;
  #eventEmitter: EventEmitter;

  constructor({ port, logger }: { port: number; logger: Logger }) {
    this.#logger = logger;

    this.#eventEmitter = new EventEmitter();
    this.#eventRegistry = new EventRegistry();

    this.#wss = new WebSocket.Server({ port });
    this.#wss.on("connection", this.#handleConnection);
  }

  #handleConnection = (socket: WebSocket, request: http.IncomingMessage) => {
    this.#sockets.add(socket);
    this.#logger.debug("client added");

    socket.on("message", (rawData) => {
      if (typeof rawData !== "string") {
        this.#logger.error("received non-string data");
        return;
      }

      const event = parseJson(rawData);

      if (!isRawEvent(event)) {
        this.#logger.error("received invalid JSON data");
        return;
      }

      if (!this.#eventRegistry.validateEvent(event)) {
        this.#logger.error("received unknown event of type", event.type);
        return;
      }

      this.#eventEmitter.emit(event.type, event.data);
    });

    socket.on("close", () => {
      this.#sockets.delete(socket);
      this.#logger.debug("client removed");
    });
  };
}