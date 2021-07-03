import http from "http";
import WebSocket from "ws";
import { AtemService } from "./services/atem-service/AtemService";
import { AtemQuadTallyState, AtemTallyService } from "./services/atem-service/AtemTallyService";

interface Logger {
  log(...args: any[]): void;
  error(...args: any[]): void;
}

class ConsoleLogger implements Logger {
  public log(...args: any[]) {
    console.info(...args);
  }
  public error(...args: any[]) {
    console.error(...args);
  }
}

class Client {
  socket: WebSocket;

  constructor(socket: WebSocket) {
    this.socket = socket;
  }

  sendMessage<T extends string, D>(type: T, data: D) {
    console.log("sending message", { type, data });

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
  private wss;
  private clients = new Set<Client>();
  private atemService: AtemService;
  private atemTallyService: AtemTallyService;

  constructor({
    logger,
    port,
    atemIp,
  }: {
    logger: Logger;
    port: number;
    atemIp: string;
  }) {
    this.logger = logger;
    this.wss = new WebSocket.Server({ port });
    this.wss.on("connection", this.handleConnection);
    this.logger.log(`Listening on port ${port}`);
    this.atemService = new AtemService();
    this.atemTallyService = new AtemTallyService({
      atemService: this.atemService,
    });
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
    this.publishMessage("atemTallyUpdate", tallies ?? this.atemTallyService.tallyState);
  }

  private handleConnection = (
    socket: WebSocket,
    request: http.IncomingMessage
  ) => {
    const client = new Client(socket);
    this.clients.add(client);
    console.log("client added");

    socket.on("message", (rawData) => {
      if (typeof rawData !== "string") {
        console.error("received non-string data");
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
            console.error("received unknown message of type", type);
        }
      } catch (err) {
        console.error("received invalid data", rawData);
      }
    });

    socket.on("close", () => {
      this.clients.delete(client);
      console.log("client removed");
    });
  };
}

new Server({
  logger: new ConsoleLogger(),
  port: 8080,
  atemIp: "192.168.2.104",
});
