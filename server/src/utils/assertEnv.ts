export function assertEnv(key: string) {
  const value = process.env[key];

  if (value === undefined || value === '') {
    throw new Error(`${key} missing in environment variables`);
  }

  return value;
}
