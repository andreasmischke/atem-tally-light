import createStore from "zustand";
import { TallyLightClient } from "./TallyLightClient";

const client = new TallyLightClient();
const useStore = createStore(client.store);

export { useStore as useTallyLightClient };
