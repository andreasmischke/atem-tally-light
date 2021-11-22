import { RxCollection, RxDatabase } from "rxdb";

export interface AtemConnection {
  id: string;
  connected: boolean;
  lastTime: string;
}
const atem_connection = {
  schema: {
    title: "atem_state",
    version: 0,
    primaryKey: "id",
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      connected: {
        type: "boolean",
      },
      lastTime: {
        type: "string",
      },
    },
  },
};

export interface AtemTally {
  inputId: string;
  longName: string;
  shortName: string;
  isPreview: boolean;
  isProgram: boolean;
}
const atem_tallies = {
  schema: {
    title: "atem_tallies",
    version: 0,
    primaryKey: "inputId",
    type: "object",
    properties: {
      inputId: {
        type: "string",
      },
      longName: {
        type: "string",
      },
      shortName: {
        type: "string",
      },
      isPreview: {
        type: "boolean",
      },
      isProgram: {
        type: "boolean",
      },
    },
  },
};

export type LivestreamDatabase = RxDatabase<{
  atem_connection: RxCollection<AtemConnection>;
  atem_tallies: RxCollection<AtemTally>;
}>;
export const collections = {
  atem_connection,
  atem_tallies,
};
