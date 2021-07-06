import createStore from "zustand/vanilla";
import { devtools } from "zustand/middleware";
import { WebSocketClient } from "../web-socket-client";

export interface TallyState {
  inputNumber: number;
  isPreview: boolean;
  isProgram: boolean;
}
export interface TallyLightClientState {
  connected: boolean;
  tallies: TallyState[];
}

const initialTallyState: TallyState[] = [
  {
    inputNumber: 1,
    isPreview: false,
    isProgram: false,
  },
  {
    inputNumber: 2,
    isPreview: false,
    isProgram: false,
  },
  {
    inputNumber: 3,
    isPreview: false,
    isProgram: false,
  },
  {
    inputNumber: 4,
    isPreview: false,
    isProgram: false,
  },
];

export class TallyLightClient {
  private webSocketClient: WebSocketClient;

  public store = createStore<TallyLightClientState>(
    devtools((set, get) => ({
      connected: false,
      tallies: initialTallyState,
    }))
  );

  constructor() {
    this.webSocketClient = new WebSocketClient({
      hostname: window.location.hostname,
      port: "8080",
    });

    this.webSocketClient.onMessage(({ type, data }) => {
      switch (type) {
        case "atemConnectionUpdate":
          this.store.setState({ connected: Boolean(data.connected) });
          break;
        case "atemTallyUpdate":
          const x = data as any;
          this.store.setState({
            tallies: [
              {
                inputNumber: 1,
                isPreview: x?.[0]?.isPreview ?? false,
                isProgram: x?.[0]?.isProgram ?? false,
              },
              {
                inputNumber: 2,
                isPreview: x?.[1]?.isPreview ?? false,
                isProgram: x?.[1]?.isProgram ?? false,
              },
              {
                inputNumber: 3,
                isPreview: x?.[2]?.isPreview ?? false,
                isProgram: x?.[2]?.isProgram ?? false,
              },
              {
                inputNumber: 4,
                isPreview: x?.[3]?.isPreview ?? false,
                isProgram: x?.[3]?.isProgram ?? false,
              },
            ],
          });
          break;
      }
    });
    this.webSocketClient.send("announceConnectionState");
    this.webSocketClient.send("announceTallyState");

    this.webSocketClient.onError((event) => console.warn(event));
  }
}
