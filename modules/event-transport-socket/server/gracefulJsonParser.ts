export function parseJson(rawData: string): any | undefined {
  try {
    return JSON.parse(rawData);
  } catch (e) {
    return undefined;
  }
}
