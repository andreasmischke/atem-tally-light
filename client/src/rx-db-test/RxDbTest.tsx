import { useCallback, useEffect, useRef, useState, VFC } from "react";
import {
  addPouchPlugin,
  createRxDatabase,
  getRxStoragePouch,
  RxDocument,
} from "rxdb";
import { Observable } from "rxjs";
import {
  AtemConnection,
  AtemTally,
  collections,
  LivestreamDatabase,
} from "../tally-light-client/collections";
import { CONFIG } from "../tally-light-client/config";

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

class TallyLightClient {
  public readonly status$: Observable<RxDocument<AtemConnection, {}> | null>;
  dbConnection: Promise<LivestreamDatabase>;

  public constructor() {
    this.dbConnection = createDb();

    this.status$ = new Observable<RxDocument<AtemConnection> | null>(
      (subscriber) => {
        this.dbConnection.then((db) => {
          db.atem_connection
            .findOne()
            .where("id")
            .eq("singleton")
            .$.subscribe(subscriber);
        });
      }
    );
  }

  public async atemStatus$(
    listener: (value: RxDocument<AtemConnection> | null) => void
  ) {
    const db = await this.dbConnection;
    const subscription = db.atem_connection
      .findOne()
      .where("id")
      .eq("singleton")
      .$.subscribe(listener);

    return subscription;
  }

  public async tallies$(listener: (value: RxDocument<AtemTally>[]) => void) {
    const db = await this.dbConnection;
    const subscription = db.atem_tallies.find().$.subscribe(listener);

    return subscription;
  }
}

interface RxDbTestProps {}

export const RxDbTest: VFC<RxDbTestProps> = ({}) => {
  const clientRef = useRef<TallyLightClient>();
  const [data, setData] = useState<string>();

  useEffect(() => {
    if (clientRef.current === undefined) {
      clientRef.current = new TallyLightClient();
    }

    const subscription = clientRef.current.status$.subscribe((doc) => {
      setData(JSON.stringify(doc, null, 2));
    });

    return () => subscription.unsubscribe();
  }, []);

  const addEntry = useCallback(async (event) => {
    // event.preventDefault();
    // const dbRef = await rxdb;
    // await dbRef.atem_connection.upsert({
    //   id: "singleton",
    //   connected: Math.random() < 0.5,
    //   lastTime: "",
    // });
  }, []);

  return (
    <>
      <h1>Hello RxDB</h1>
      <button onClick={addEntry}>Populate data</button>
      <pre>{data}</pre>
    </>
  );
};
