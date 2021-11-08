import http from "http";
import WebSocket from "ws";
import { AtemService } from "./services/atem";
import { AtemTallyState, AtemTallyService } from "./services/atem-tally";
import { ConsoleLogger, Logger } from "./services/logger";

class Client {
  #socket: WebSocket;
  #logger: Logger;

  constructor({ socket, logger }: { socket: WebSocket; logger: Logger }) {
    this.#logger = logger;
    this.#socket = socket;
  }

  sendMessage<T extends string, D>(type: T, data: D) {
    this.#logger.debug("sending message", { type, data });

    this.#socket.send(
      JSON.stringify({
        type,
        data,
      })
    );
  }
}

class Server {
  #logger: Logger;
  #atemService: AtemService;
  #atemTallyService: AtemTallyService;

  #wss: WebSocket.Server;
  #clients: Set<Client>;

  constructor({
    port,
    atemIp,
    logger,
    atemService,
    atemTallyService,
  }: {
    port: number;
    atemIp: string;
    logger: Logger;
    atemService: AtemService;
    atemTallyService: AtemTallyService;
  }) {
    this.#logger = logger;
    this.#atemService = atemService;
    this.#atemTallyService = atemTallyService;

    this.#clients = new Set();
    this.#wss = new WebSocket.Server({ port });
    this.#wss.on("connection", this.#handleConnection);
    this.#logger.info(`Listening on port ${port}`);
    this.#atemTallyService.onTallyUpdate(this.#publishAtemTallyUpdate);
    this.#atemService.onConnectionChange(this.#publishAtemConnectionUpdate);
    this.#atemService.connect({ ip: atemIp });
  }

  #publishMessage = <T extends string, D>(type: T, data: D) => {
    this.#clients.forEach((client) => client.sendMessage(type, data));
  };

  #publishAtemConnectionUpdate = (connected?: boolean) => {
    this.#publishMessage("atemConnectionUpdate", {
      connected: connected ?? this.#atemService.connected,
    });
  };

  #publishAtemTallyUpdate = (tallies?: AtemTallyState[]) => {
    this.#publishMessage(
      "atemTallyUpdate",
      tallies ?? this.#atemTallyService.tallyState
    );
  };

  #createClient = ({ socket }: { socket: WebSocket }) => {
    return new Client({ socket, logger: this.#logger });
  };

  #handleConnection = (socket: WebSocket, request: http.IncomingMessage) => {
    const client = this.#createClient({ socket });
    this.#clients.add(client);
    this.#logger.debug("client added");

    socket.on("message", (rawData) => {
      if (typeof rawData !== "string") {
        this.#logger.error("received non-string data");
        return;
      }

      try {
        const { event, requestId, data } = JSON.parse(rawData);
        switch (event) {
          case "announceConnectionState":
            this.#publishAtemConnectionUpdate();
            break;
          case "announceTallyState":
            this.#publishAtemTallyUpdate();
            break;
          default:
            this.#logger.error("received unknown event", event);
        }
      } catch (err) {
        this.#logger.error("received invalid data", rawData);
      }
    });

    socket.on("close", () => {
      this.#clients.delete(client);
      this.#logger.debug("client removed");
    });
  };
}

(function main({ port, atemIp }: { port: number; atemIp: string }) {
  const logger = new ConsoleLogger();
  const atemService = new AtemService({ logger });
  const atemTallyService = new AtemTallyService({ atemService, logger });
  new Server({
    port,
    atemIp,
    atemService,
    atemTallyService,
    logger,
  });
})({
  port: 8080,
  atemIp: "192.168.2.104",
});
