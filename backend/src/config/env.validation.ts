const INSECURE_JWT_SECRETS = new Set([
  'change-me',
  'replace-with-real-secret-before-production',
]);

export function validateEnvironment(config: Record<string, unknown>) {
  const databaseUrl = readRequiredString(config, 'DATABASE_URL');
  const jwtSecret = readRequiredString(config, 'JWT_SECRET');

  if (jwtSecret.length < 32 || INSECURE_JWT_SECRETS.has(jwtSecret)) {
    throw new Error('JWT_SECRET must be a non-placeholder value of at least 32 characters');
  }

  const port = Number(config.PORT ?? 8000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return {
    ...config,
    DATABASE_URL: databaseUrl,
    JWT_SECRET: jwtSecret,
    PORT: port,
  };
}

function readRequiredString(config: Record<string, unknown>, key: string) {
  const value = config[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${key} is required`);
  }
  return value;
}
