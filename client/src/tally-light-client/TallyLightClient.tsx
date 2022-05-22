import { addPouchPlugin, createRxDatabase, getRxStoragePouch } from "rxdb";
import createStore from "zustand/vanilla";
import { devtools, persist } from "zustand/middleware";
import { collections, LivestreamDatabase } from "./collections";
import { CONFIG } from "./config";

addPouchPlugin(require("pouchdb-adapter-idb"));
addPouchPlugin(require("pouchdb-adapter-http"));

async function createDb() {
  if ((window as any).RXDB_INSTANCE) {
    return (window as any).RXDB_INSTANCE as LivestreamDatabase;
  }

  const db: LivestreamDatabase = await createRxDatabase({
    name: CONFIG.DB_NAME,
    storage: getRxStoragePouch("idb"),
    options: {},
  });

  (window as any).RXDB_INSTANCE = db;

  await db.addCollections(collections);

  db.atem_connection.syncCouchDB({
    remote: `${CONFIG.DB_PROT}://${CONFIG.DB_NAME}:${CONFIG.DB_PASS}@${CONFIG.DB_HOST}/atem_connection`,
    options: {
      live: true,
      retry: true,
    },
  });

  return db;
}

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
    createDb().then((db) => {
      db.atem_connection
        .findOne()
        .where("id")
        .eq("singleton")
        .$.subscribe((connection) => {
          if (connection === null) {
            return;
          }
          this.store.setState({
            connected: connection.connected,
          });
        });

      db.atem_tallies.find().$.subscribe((tallies) => {
        this.store.setState((state) => ({
          tallies: tallies.map((tally) => {
            const tallyInputId = parseInt(tally.inputId, 10);
            return {
              ...tally,
              inputId: tallyInputId,
              selected:
                state.tallies.find(({ inputId }) => inputId === tallyInputId)
                  ?.selected ?? false,
            };
          }),
        }));
      });
    });
  }
}
