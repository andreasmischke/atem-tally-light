import { useCallback, useEffect, useState, VFC } from "react";
import {
  addPouchPlugin,
  createRxDatabase,
  getRxStoragePouch,
  RxDatabase,
} from "rxdb";

addPouchPlugin(require("pouchdb-adapter-idb"));
addPouchPlugin(require("pouchdb-adapter-http"));

async function createDb() {
  if ((window as any).RXDB_INSTANCE) {
    return (window as any).RXDB_INSTANCE as RxDatabase;
  }
  const db = await createRxDatabase({
    name: "mischke",
    storage: getRxStoragePouch("idb"),
    options: {},
  });

  (window as any).RXDB_INSTANCE = db;

  await db.addCollections({
    keyvalue: {
      schema: {
        title: "key-value-schema",
        version: 0,
        primaryKey: "key",
        type: "object",
        properties: {
          key: {
            type: "string",
          },
          value: {
            type: "string",
          },
        },
        required: ["key", "value"],
      },
    },
  });

//   db.keyvalue.syncCouchDB({
//     remote: "https://admin:password@hostname/dbname",
//     options: {
//       live: true,
//       retry: true,
//     },
//   });

  return db;
}

const dbPromise = createDb();

interface RxDbTestProps {}

export const RxDbTest: VFC<RxDbTestProps> = ({}) => {
  const [data, setData] = useState<any[]>();
  const [isLeader, setLeader] = useState(false);

  useEffect(() => {
    (async function () {
      try {
        const db = await dbPromise;
        setData(await db.keyvalue.find().exec());
        db.waitForLeadership().then(() => setLeader(true));
        db.keyvalue.$.subscribe(async () => {
          setData(await db.keyvalue.find().exec());
        });
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const addEntry = useCallback(async (event) => {
    event.preventDefault();

    const key = event.currentTarget.elements.key.value;
    const value = event.currentTarget.elements.value.value;

    const db = await dbPromise;

    await db.keyvalue.upsert({
      key,
      value,
    });
  }, []);

  return (
    <>
      <h1>Hello RxDB{isLeader && " (is leader)"}</h1>
      {dbPromise === undefined ? (
        <em>Loading database...</em>
      ) : (
        <>
          <form onSubmit={addEntry}>
            <input type="text" name="key" placeholder="key" />
            <br />
            <input type="text" name="value" placeholder="value" />
            <button type="submit">Save</button>
          </form>
          <ul>
            {data?.map(({ key, value }, id) => {
              console.log(key, value);
              return (
                <li key={key}>
                  {key}: {value}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
};
