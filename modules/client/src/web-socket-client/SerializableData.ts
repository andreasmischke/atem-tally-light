type Scalar = string | number | boolean;

export interface SerializableData {
    [key: string]: Scalar | Scalar[] | SerializableData | SerializableData[];
}
