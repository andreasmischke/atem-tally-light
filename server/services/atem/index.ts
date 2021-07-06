import { Atem, AtemState } from "atem-connection";
import { Logger } from "../logger";
export type { AtemState } from "atem-connection";

type AtemConnectionListener = (isConnected: boolean) => void | Promise<void>;
type AtemStateListener = (state: AtemState) => void | Promise<void>;

export class AtemService {
  readonly #atem = new Atem({ childProcessTimeout: 100 });
  #isConnected = false;
  readonly #connectionListeners = new Set<AtemConnectionListener>();
  readonly #stateListeners = new Set<AtemStateListener>();
  readonly #logger: Logger;

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
    this.#connectionListeners.add(listener);
    return () => this.#connectionListeners.delete(listener);
  }

  onStateChange(listener: AtemStateListener): VoidFunction {
    this.#stateListeners.add(listener);
    return () => this.#stateListeners.delete(listener);
  }

  #trackConnectionState = () =>  {
    const createConnectionStateChangeHandler = (newState: boolean) => () => {
      this.#isConnected = newState;
      this.#connectionListeners.forEach((listener) => listener(newState));
    };
    this.#atem.on("connected", createConnectionStateChangeHandler(true));
    this.#atem.on("disconnected", createConnectionStateChangeHandler(false));
  }

  #trackStateChanges = () => {
    this.#atem.on("stateChanged", (state: AtemState, changedPaths: string[]) => {
      this.#stateListeners.forEach((listener) => listener(state));
    });
  }
}
