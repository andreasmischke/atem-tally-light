import createStore from "zustand";
import { TallyLightClient } from "./TallyLightClient";

const client = new TallyLightClient();
export const useTallyLightClient = createStore(client.store);
