/**
 * Configuration module that loads secrets from Google Cloud Secret Manager
 * or falls back to environment variables for local development
 */

import { getSecret, getSecretWithFallback } from './secrets-manager';

export interface Config {
  sanity: {
    projectId: string;
    dataset: string;
    apiToken?: string;
  };
  supabase: {
    url: string;
    anonKey?: string;
    serviceKey?: string;
  };
  unsplash: {
    accessKey?: string;
  };
  site: {
    url: string;
    authorizedEmail?: string;
  };
}

let configCache: Config | null = null;

/**
 * Load configuration from Secret Manager and environment variables
 */
export async function loadConfig(): Promise<Config> {
  // Return cached config if available
  if (configCache) {
    return configCache;
  }

  console.log('🔧 Loading configuration...');

  try {
    // Load secrets in parallel for better performance
    // Note: Some secrets don't have environment suffixes in the current setup
    const [
      sanityApiToken,
      supabaseServiceKey,
      supabaseAnonKey,
      unsplashAccessKey
    ] = await Promise.all([
      // Try with STG suffix first, then without suffix
      getSecretWithFallback('SANITY_API_TOKEN_STG', 'SANITY_API_TOKEN_STG')
        .then(token => token || getSecretWithFallback('SANITY_API_TOKEN', 'SANITY_API_TOKEN')),
      getSecretWithFallback('SUPABASE_SERVICE_KEY', 'SUPABASE_SERVICE_KEY'),
      getSecretWithFallback('SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      getSecretWithFallback('UNSPLASH_ACCESS_KEY', 'UNSPLASH_ACCESS_KEY')
    ]);

    const config: Config = {
      sanity: {
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'svg08vjt',
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
        apiToken: sanityApiToken
      },
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cibjeqgftuxuezarjsdl.supabase.co',
        anonKey: supabaseAnonKey,
        serviceKey: supabaseServiceKey
      },
      unsplash: {
        accessKey: unsplashAccessKey
      },
      site: {
        url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        authorizedEmail: process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL
      }
    };

    // Cache the configuration
    configCache = config;

    console.log('✅ Configuration loaded successfully');
    console.log('📊 Loaded secrets:', {
      sanityApiToken: !!sanityApiToken,
      supabaseServiceKey: !!supabaseServiceKey,
      supabaseAnonKey: !!supabaseAnonKey,
      unsplashAccessKey: !!unsplashAccessKey
    });

    return config;

  } catch (error) {
    console.error('❌ Failed to load configuration:', error);

    // Return minimal config with public values only
    return {
      sanity: {
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'svg08vjt',
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
      },
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cibjeqgftuxuezarjsdl.supabase.co'
      },
      unsplash: {},
      site: {
        url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        authorizedEmail: process.env.NEXT_PUBLIC_AUTHORIZED_EMAIL
      }
    };
  }
}

/**
 * Get the current configuration (loads if not cached)
 */
export async function getConfig(): Promise<Config> {
  if (!configCache) {
    return loadConfig();
  }
  return configCache;
}

/**
 * Clear the configuration cache
 */
export function clearConfigCache(): void {
  configCache = null;
  console.log('🧹 Configuration cache cleared');
}

/**
 * Helper to check if all required secrets are loaded
 */
export async function validateSecrets(): Promise<{
  valid: boolean;
  missing: string[];
}> {
  const config = await loadConfig();
  const missing: string[] = [];

  // Check required secrets based on environment
  if (!config.sanity.apiToken) {
    missing.push('SANITY_API_TOKEN');
  }

  // For production, require more secrets
  if (process.env.NODE_ENV === 'production') {
    if (!config.supabase.serviceKey) {
      missing.push('SUPABASE_SERVICE_KEY');
    }
  }

  return {
    valid: missing.length === 0,
    missing
  };
}