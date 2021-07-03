import { Atem, AtemState } from "atem-connection";
export type { AtemState } from "atem-connection";

type AtemConnectionListener = (isConnected: boolean) => void | Promise<void>;
type AtemStateListener = (state: AtemState) => void | Promise<void>;

export class AtemService {
  private readonly atem = new Atem({ childProcessTimeout: 100 });
  private isConnected = false;
  private readonly connectionListeners = new Set<AtemConnectionListener>();
  private readonly stateListeners = new Set<AtemStateListener>();

  public constructor() {
    this.atem.on("error", (error) => {
      console.error("ATEM ERROR occured");
      console.error(error);
    });

    this.trackConnectionState();
    this.trackStateChanges();
  }

  public async connect({ ip }: { ip: string }): Promise<void> {
    return new Promise<void>((resolve) => {
      this.atem.once("connected", () => {
        this.isConnected = true;
        resolve();
      });

      this.atem.connect(ip);
    }).then(() => this.atem.requestTime());
  }

  public get state() {
    return this.atem.state;
  }

  public get connected() {
    return this.isConnected;
  }

  public onConnectionChange(listener: AtemConnectionListener): VoidFunction {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  public onStateChange(listener: AtemStateListener): VoidFunction {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  private trackConnectionState() {
    const createConnectionStateChangeHandler = (newState: boolean) => () => {
      this.isConnected = newState;
      this.connectionListeners.forEach((listener) => listener(newState));
    };
    this.atem.on("connected", createConnectionStateChangeHandler(true));
    this.atem.on("disconnected", createConnectionStateChangeHandler(false));
  }

  private trackStateChanges() {
    this.atem.on("stateChanged", (state: AtemState, changedPaths: string[]) => {
      this.stateListeners.forEach((listener) => listener(state));
    });
  }
}
