import http from "http";
import WebSocket from "ws";
import { AtemService } from "./services/atem";
import { AtemQuadTallyState, AtemTallyService } from "./services/atem-tally";
import { ConsoleLogger, Logger } from "./services/logger";

class Client {
  private socket: WebSocket;
  private logger: Logger;

  constructor({ socket, logger }: { socket: WebSocket; logger: Logger }) {
    this.logger = logger;
    this.socket = socket;
  }

  sendMessage<T extends string, D>(type: T, data: D) {
    this.logger.debug("sending message", { type, data });

    this.socket.send(
      JSON.stringify({
        type,
        data,
      })
    );
  }
}

class Server {
  private logger: Logger;
  private atemService: AtemService;
  private atemTallyService: AtemTallyService;

  private wss;
  private clients = new Set<Client>();

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
    this.logger = logger;
    this.atemService = atemService;
    this.atemTallyService = atemTallyService;

    this.wss = new WebSocket.Server({ port });
    this.wss.on("connection", this.handleConnection);
    this.logger.info(`Listening on port ${port}`);
    this.atemTallyService.onTallyUpdate(this.publishAtemTallyUpdate.bind(this));
    this.atemService.onConnectionChange(
      this.publishAtemConnectionUpdate.bind(this)
    );
    this.atemService.connect({ ip: atemIp });

    process.stdin.on("data", (data) => {
      const key = data.toString("utf-8");
      if (key.trim() === "r") {
        process.exit(99);
      }
    });
  }

  private publishMessage<T extends string, D>(type: T, data: D) {
    this.clients.forEach((client) => client.sendMessage(type, data));
  }

  private publishAtemConnectionUpdate(connected?: boolean) {
    this.publishMessage("atemConnectionUpdate", {
      connected: connected ?? this.atemService.connected,
    });
  }

  private publishAtemTallyUpdate(tallies?: AtemQuadTallyState) {
    this.publishMessage(
      "atemTallyUpdate",
      tallies ?? this.atemTallyService.tallyState
    );
  }

  private createClient({ socket }: { socket: WebSocket }) {
    return new Client({ socket, logger: this.logger });
  }

  private handleConnection = (
    socket: WebSocket,
    request: http.IncomingMessage
  ) => {
    const client = this.createClient({ socket });
    this.clients.add(client);
    this.logger.debug("client added");

    socket.on("message", (rawData) => {
      if (typeof rawData !== "string") {
        this.logger.error("received non-string data");
        return;
      }

      try {
        const { type, requestId, data } = JSON.parse(rawData);
        switch (type) {
          case "announceConnectionState":
            this.publishAtemConnectionUpdate();
            break;
          case "announceTallyState":
            this.publishAtemTallyUpdate();
            break;
          default:
            this.logger.error("received unknown message of type", type);
        }
      } catch (err) {
        this.logger.error("received invalid data", rawData);
      }
    });

    socket.on("close", () => {
      this.clients.delete(client);
      this.logger.debug("client removed");
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
