import EventEmitter from "eventemitter3";
import { Atem, AtemState } from "atem-connection";
import { Logger } from "../logger";
export type { AtemState } from "atem-connection";

type AtemConnectionListener = (isConnected: boolean) => void | Promise<void>;
type AtemStateListener = (state: AtemState) => void | Promise<void>;

export class AtemService {
  readonly #atem = new Atem({ childProcessTimeout: 100 });
  readonly #eventBus = new EventEmitter<{
    connectionUpdate: AtemConnectionListener;
    stateUpdate: AtemStateListener;
  }>();
  readonly #logger: Logger;

  #isConnected = false;

  constructor({ logger }: { logger: Logger }) {
    this.#logger = logger;
    this.#atem.on("error", (error) => {
      this.#logger.error("ATEM ERROR occured");
      this.#logger.error(error);
    });

    this.#trackConnectionState();
    this.#trackStateChanges();
  }

  async connect({ ip }: { ip: string }): Promise<void> {
    return new Promise<void>((resolve) => {
      this.#atem.once("connected", () => {
        this.#isConnected = true;
        resolve();
      });

      this.#atem.connect(ip);
    }).then(() => this.#atem.requestTime());
  }

  get state() {
    return this.#atem.state;
  }

  get connected() {
    return this.#isConnected;
  }

  onConnectionChange(listener: AtemConnectionListener): VoidFunction {
    this.#eventBus.on("connectionUpdate", listener);
    return () => this.#eventBus.off("connectionUpdate", listener);
  }

  onStateChange(listener: AtemStateListener): VoidFunction {
    this.#eventBus.on("stateUpdate", listener);
    return () => this.#eventBus.off("stateUpdate", listener);
  }

  #trackConnectionState = () => {
    const createConnectionStateChangeHandler = (newState: boolean) => () => {
      this.#isConnected = newState;
      this.#eventBus.emit("connectionUpdate", newState);
    };
    this.#atem.on("connected", createConnectionStateChangeHandler(true));
    this.#atem.on("disconnected", createConnectionStateChangeHandler(false));
  };

  #trackStateChanges = () => {
    this.#atem.on(
      "stateChanged",
      (state: AtemState, changedPaths: string[]) => {
        this.#eventBus.emit("stateUpdate", state);
      }
    );
  };
}
