import assert from 'node:assert/strict';
import test from 'node:test';
import { validateEnvironment } from './env.validation';

const validConfig = {
  DATABASE_URL: 'postgresql://user:password@localhost:5432/database',
  JWT_SECRET: 'a-secure-test-secret-that-is-at-least-32-characters',
};

test('accepts valid required configuration and normalizes the port', () => {
  const result = validateEnvironment({ ...validConfig, PORT: '8000' });
  assert.equal(result.PORT, 8000);
});

test('rejects a missing database URL', () => {
  assert.throws(
    () => validateEnvironment({ JWT_SECRET: validConfig.JWT_SECRET }),
    /DATABASE_URL is required/,
  );
});

test('rejects placeholder and short JWT secrets', () => {
  assert.throws(
    () => validateEnvironment({ ...validConfig, JWT_SECRET: 'change-me' }),
    /JWT_SECRET must be a non-placeholder value/,
  );
  assert.throws(
    () => validateEnvironment({ ...validConfig, JWT_SECRET: 'too-short' }),
    /JWT_SECRET must be a non-placeholder value/,
  );
});
