/**
 * Google Cloud Secret Manager Integration
 * Following API-KEY-MANAGEMENT-POLICY.md
 *
 * This module provides secure access to API keys and secrets
 * stored in Google Cloud Secret Manager.
 */

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Initialize the Secret Manager client
let client: SecretManagerServiceClient | null = null;

// Cache for secrets to avoid repeated API calls
const secretsCache = new Map<string, { value: string; timestamp: number }>();
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * Get the current environment
 * @returns 'production' | 'staging' | 'development'
 */
function getEnvironment(): 'production' | 'staging' | 'development' {
  const env = process.env.NODE_ENV || 'development';

  // Map Vercel/deployment environments
  if (process.env.VERCEL_ENV === 'production') return 'production';
  if (process.env.VERCEL_ENV === 'preview') return 'staging';

  // Default mappings
  if (env === 'production') return 'production';
  if (env === 'test' || env === 'staging') return 'staging';

  return 'development';
}

/**
 * Get the project ID from environment or use default
 */
function getProjectId(): string {
  return process.env.GOOGLE_CLOUD_PROJECT ||
         process.env.GCP_PROJECT_ID ||
         'careful-drummer-468512-p0';
}

/**
 * Initialize the Secret Manager client
 */
function initializeClient(): SecretManagerServiceClient {
  if (!client) {
    // For local development, credentials should be set via:
    // - GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to service account key file
    // - Or gcloud auth application-default login
    client = new SecretManagerServiceClient();
  }
  return client;
}

/**
 * Format secret name according to naming convention
 * @param secretName - Base name of the secret
 * @param environment - Optional environment override
 * @returns Formatted secret name
 */
function formatSecretName(
  secretName: string,
  environment?: 'production' | 'staging' | 'development'
): string {
  const env = environment || getEnvironment();

  // Map environment to suffix
  const suffixMap = {
    'production': '_PROD',
    'staging': '_STG',
    'development': '_DEV'
  };

  const suffix = suffixMap[env];

  // If secret already has an environment suffix, return as is
  if (secretName.endsWith('_PROD') ||
      secretName.endsWith('_STG') ||
      secretName.endsWith('_DEV')) {
    return secretName;
  }

  // For development, first try without suffix (for backward compatibility)
  // Then try with suffix
  if (env === 'development') {
    return secretName; // Try without suffix first in dev
  }

  return `${secretName}${suffix}`;
}

/**
 * Fetch a secret from Google Cloud Secret Manager
 * @param secretName - Name of the secret (will be auto-suffixed with environment)
 * @param options - Optional configuration
 * @returns The secret value
 */
export async function getSecret(
  secretName: string,
  options?: {
    environment?: 'production' | 'staging' | 'development';
    useCache?: boolean;
    projectId?: string;
  }
): Promise<string> {
  const {
    environment,
    useCache = true,
    projectId = getProjectId()
  } = options || {};

  // Format the secret name with environment suffix
  const formattedSecretName = formatSecretName(secretName, environment);
  const cacheKey = `${projectId}/${formattedSecretName}`;

  // Check cache first
  if (useCache) {
    const cached = secretsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TIMEOUT) {
      console.log(`✅ Secret ${formattedSecretName} retrieved from cache`);
      return cached.value;
    }
  }

  // For local development, check .env.local first (but log a warning)
  if (getEnvironment() === 'development') {
    const envValue = process.env[secretName];
    if (envValue) {
      console.warn(`⚠️  Using local environment variable for ${secretName}. In production, this will come from Secret Manager.`);
      return envValue;
    }
  }

  try {
    // Initialize client
    const secretManagerClient = initializeClient();

    // Build the resource name
    const name = `projects/${projectId}/secrets/${formattedSecretName}/versions/latest`;

    console.log(`🔐 Fetching secret: ${formattedSecretName} from Secret Manager`);

    // Access the secret
    const [version] = await secretManagerClient.accessSecretVersion({ name });

    if (!version.payload || !version.payload.data) {
      throw new Error(`Secret ${formattedSecretName} has no data`);
    }

    // Decode the secret payload
    const secretValue = version.payload.data.toString();

    // Cache the result
    if (useCache) {
      secretsCache.set(cacheKey, {
        value: secretValue,
        timestamp: Date.now()
      });
    }

    console.log(`✅ Secret ${formattedSecretName} retrieved successfully`);
    return secretValue;

  } catch (error: any) {
    // Enhanced error handling for common issues
    if (error.code === 5) { // NOT_FOUND
      console.error(`❌ Secret ${formattedSecretName} not found in project ${projectId}`);
      console.error(`   Make sure the secret exists and follows naming convention: {SERVICE}_{KEY_TYPE}_{ENVIRONMENT}`);
    } else if (error.code === 7) { // PERMISSION_DENIED
      console.error(`❌ Permission denied accessing secret ${formattedSecretName}`);
      console.error(`   Ensure the service account has 'secretmanager.secretAccessor' role`);
    } else {
      console.error(`❌ Failed to fetch secret ${formattedSecretName}:`, error.message);
    }

    // In development, provide a helpful error message
    if (getEnvironment() === 'development') {
      throw new Error(
        `Failed to fetch secret '${formattedSecretName}'. ` +
        `For local development, either:\n` +
        `1. Set up Google Cloud credentials (recommended)\n` +
        `2. Add ${secretName}=<value> to your .env.local file (temporary)`
      );
    }

    throw error;
  }
}

/**
 * Batch fetch multiple secrets
 * @param secretNames - Array of secret names
 * @param options - Optional configuration
 * @returns Map of secret names to values
 */
export async function getSecrets(
  secretNames: string[],
  options?: {
    environment?: 'production' | 'staging' | 'development';
    useCache?: boolean;
    projectId?: string;
  }
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  // Fetch all secrets in parallel
  const promises = secretNames.map(async (secretName) => {
    try {
      const value = await getSecret(secretName, options);
      return { secretName, value };
    } catch (error) {
      console.error(`Failed to fetch secret ${secretName}:`, error);
      return { secretName, value: null };
    }
  });

  const secretResults = await Promise.all(promises);

  // Build the results map
  for (const { secretName, value } of secretResults) {
    if (value !== null) {
      results.set(secretName, value);
    }
  }

  return results;
}

/**
 * Clear the secrets cache
 */
export function clearSecretsCache(): void {
  secretsCache.clear();
  console.log('🧹 Secrets cache cleared');
}

/**
 * Get secret with fallback to environment variable
 * Useful for gradual migration to Secret Manager
 */
export async function getSecretWithFallback(
  secretName: string,
  envVarName?: string
): Promise<string | undefined> {
  // Check environment variable first (for backward compatibility)
  const envValue = process.env[envVarName || secretName];
  if (envValue) {
    if (getEnvironment() !== 'development') {
      console.warn(`⚠️  Using environment variable ${envVarName || secretName}. Consider migrating to Secret Manager.`);
    }
    return envValue;
  }

  // Try to fetch from Secret Manager
  try {
    return await getSecret(secretName);
  } catch (error) {
    console.error(`Failed to fetch secret ${secretName}, and no environment variable found`);
    return undefined;
  }
}

// Export environment helper
export { getEnvironment };