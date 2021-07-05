import http from "http";
import WebSocket from "ws";
import { AtemService } from "./services/atem";
import {
  AtemQuadTallyState,
  AtemTallyService,
} from "./services/atem-tally";
import { ConsoleLogger, Logger } from "./services/logger";

interface ClientFactoryDependencies {
  logger: Logger;
}

class ClientFactory {
  private ioc: ClientFactoryDependencies;

  constructor({ ioc }: { ioc: ClientFactoryDependencies }) {
    this.ioc = ioc;
  }

  createClient({ socket }: { socket: WebSocket }) {
    return new Client({ socket, ioc: this.ioc });
  }
}
class Client {
  private socket: WebSocket;
  private logger: Logger;

  constructor({
    socket,
    ioc,
  }: {
    socket: WebSocket;
    ioc: ClientFactoryDependencies;
  }) {
    this.logger = ioc.logger;
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

interface ServerDependencies {
  logger: Logger;
  clientFactory: ClientFactory;
  atemService: AtemService;
  atemTallyService: AtemTallyService;
}
class Server {
  private logger: Logger;
  private clientFactory: ClientFactory;
  private atemService: AtemService;
  private atemTallyService: AtemTallyService;

  private wss;
  private clients = new Set<Client>();

  constructor({
    port,
    atemIp,
    ioc,
  }: {
    port: number;
    atemIp: string;
    ioc: ServerDependencies;
  }) {
    this.logger = ioc.logger;
    this.clientFactory = ioc.clientFactory;
    this.atemService = ioc.atemService;
    this.atemTallyService = ioc.atemTallyService;

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

  private handleConnection = (
    socket: WebSocket,
    request: http.IncomingMessage
  ) => {
    const client = this.clientFactory.createClient({ socket });
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

class Application {
  public readonly logger: Logger;
  public readonly clientFactory: ClientFactory;
  public readonly server: Server;
  public readonly atemService: AtemService;
  public readonly atemTallyService: AtemTallyService;

  public constructor({ port, atemIp }: { port: number; atemIp: string }) {
    this.logger = new ConsoleLogger();
    this.clientFactory = new ClientFactory({ ioc: this });
    this.atemService = new AtemService({ ioc: this });
    this.atemTallyService = new AtemTallyService({ ioc: this });
    this.server = new Server({
      port,
      atemIp,
      ioc: this,
    });
  }
}

new Application({
  port: 8080,
  atemIp: "192.168.2.104",
});
