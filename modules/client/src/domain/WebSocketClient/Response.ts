import { SerializableData } from "./SerializableData";

export interface Response {
    type: string;
    requestId?: number;
    data: SerializableData;
}
