import createStore from "zustand/vanilla";
import { devtools, persist } from "zustand/middleware";
import { WebSocketClient } from "../web-socket-client";
import { isTemplateLiteralTypeSpan } from "typescript";

export interface TallyState {
  inputId: number;
  longName: string;
  shortName: string;
  isPreview: boolean;
  isProgram: boolean;
  selected: boolean;
}
export interface TallyLightClientState {
  connected: boolean;
  tallies: TallyState[];
  selectTally: (id: number, selected: boolean) => void;
}

const initialTallyState: TallyState[] = [
  {
    inputId: 1,
    longName: "Not",
    shortName: "NO",
    isPreview: false,
    isProgram: false,
    selected: true,
  },
  {
    inputId: 2,
    longName: "Connected",
    shortName: "CONN",
    isPreview: false,
    isProgram: false,
    selected: true,
  },
];

export class TallyLightClient {
  private webSocketClient: WebSocketClient;

  public store = createStore<TallyLightClientState>(
    persist(
      devtools((set, get) => ({
        connected: false,
        tallies: initialTallyState,
        selectTally: (id, selected) => {
          set((state) => ({
            tallies: state.tallies.map((tally) => {
              if (tally.inputId === id) {
                return {
                  ...tally,
                  selected,
                };
              }
              return tally;
            }),
          }));
        },
      })),
      {
        name: "me.mischke.atem-tally-client.zustand",
        getStorage: () => localStorage,
      }
    )
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
          this.store.setState((state) => ({
            tallies: x.map((entry: TallyState) => ({
              ...entry,
              selected:
                state.tallies.find(({ inputId }) => inputId === entry.inputId)
                  ?.selected ?? false,
            })),
          }));
          break;
      }
    });
    this.webSocketClient.send("announceConnectionState");
    this.webSocketClient.send("announceTallyState");

    this.webSocketClient.onError((event) => console.warn(event));
  }
}
