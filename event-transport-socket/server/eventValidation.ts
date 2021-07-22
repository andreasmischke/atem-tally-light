type Primitive = string | number | boolean | null | undefined;

interface SerializableObject {
  [key: string]: SerializableData;
}

export type SerializableData =
  | Primitive
  | Primitive[]
  | SerializableData[]
  | SerializableObject
  | SerializableObject[];

export interface RawEvent {
  type: string;
  data?: SerializableData;
}

export function isRawEvent(json: any): json is RawEvent {
  return (
    !!json &&
    typeof json.type === "string" &&
    isValidData(json.data)
  );
}

function isValidData(data: any): data is SerializableObject {
  return (
    data === undefined ||
    data === null ||
    typeof data === "string" ||
    typeof data === "number" ||
    typeof data === "boolean" ||
    (Array.isArray(data) && data.every((item) => isValidData(item))) ||
    (typeof data === "object" &&
      Object.entries(data).every(
        ([key, value]) => typeof key === "string" && isValidData(value)
      ))
  );
}
