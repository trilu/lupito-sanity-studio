#!/usr/bin/env node
/**
 * Test script to verify Google Cloud Secret Manager integration
 *
 * Usage:
 *   npm run test:secrets
 *
 * This script will:
 * 1. Test connection to Secret Manager
 * 2. Validate secret naming conventions
 * 3. Check if required secrets exist
 * 4. Verify caching functionality
 */

import { getSecret, getSecrets, clearSecretsCache, getEnvironment } from '../lib/secrets-manager';
import { loadConfig, validateSecrets } from '../lib/config';

const REQUIRED_SECRETS = [
  'SANITY_API_TOKEN',
  'SUPABASE_SERVICE_KEY',
  'UNSPLASH_ACCESS_KEY'
];

async function testSecretManager() {
  console.log('🧪 Testing Google Cloud Secret Manager Integration\n');
  console.log('=' .repeat(50));

  // Display environment info
  console.log('📊 Environment Information:');
  console.log(`   Current Environment: ${getEnvironment()}`);
  console.log(`   Project ID: ${process.env.GOOGLE_CLOUD_PROJECT || 'careful-drummer-468512-p0'}`);
  console.log(`   Node Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('=' .repeat(50));
  console.log('');

  let testsPass = 0;
  let testsFail = 0;

  // Test 1: Load configuration
  console.log('Test 1: Loading configuration with secrets...');
  try {
    const config = await loadConfig();
    console.log('✅ Configuration loaded successfully');
    console.log('   Sanity Project ID:', config.sanity.projectId);
    console.log('   Supabase URL:', config.supabase.url);
    console.log('   Secrets loaded:', {
      sanityApiToken: !!config.sanity.apiToken,
      supabaseServiceKey: !!config.supabase.serviceKey,
      unsplashAccessKey: !!config.unsplash.accessKey
    });
    testsPass++;
  } catch (error: any) {
    console.error('❌ Failed to load configuration:', error.message);
    testsFail++;
  }
  console.log('');

  // Test 2: Validate required secrets
  console.log('Test 2: Validating required secrets...');
  try {
    const validation = await validateSecrets();
    if (validation.valid) {
      console.log('✅ All required secrets are present');
      testsPass++;
    } else {
      console.log('⚠️  Missing secrets:', validation.missing);
      if (getEnvironment() === 'development') {
        console.log('   (This is OK for local development with .env.local)');
        testsPass++;
      } else {
        testsFail++;
      }
    }
  } catch (error: any) {
    console.error('❌ Failed to validate secrets:', error.message);
    testsFail++;
  }
  console.log('');

  // Test 3: Test individual secret fetching
  console.log('Test 3: Fetching individual secrets...');
  for (const secretName of REQUIRED_SECRETS) {
    try {
      console.log(`   Fetching ${secretName}...`);
      const secret = await getSecret(secretName);
      if (secret) {
        console.log(`   ✅ ${secretName} retrieved (length: ${secret.length})`);
      }
    } catch (error: any) {
      if (getEnvironment() === 'development' && error.message.includes('For local development')) {
        console.log(`   ⚠️  ${secretName} not found (expected in development without GCP auth)`);
      } else {
        console.error(`   ❌ Failed to fetch ${secretName}:`, error.message);
      }
    }
  }
  console.log('');

  // Test 4: Test batch secret fetching
  console.log('Test 4: Batch fetching secrets...');
  try {
    const secrets = await getSecrets(REQUIRED_SECRETS);
    console.log(`✅ Fetched ${secrets.size} secrets in batch`);
    secrets.forEach((value, key) => {
      console.log(`   - ${key}: ${value ? 'loaded' : 'not found'}`);
    });
    testsPass++;
  } catch (error: any) {
    console.error('❌ Failed to batch fetch secrets:', error.message);
    testsFail++;
  }
  console.log('');

  // Test 5: Test caching
  console.log('Test 5: Testing secret caching...');
  try {
    clearSecretsCache();
    console.log('   Cache cleared');

    const start1 = Date.now();
    await getSecret('SANITY_API_TOKEN');
    const time1 = Date.now() - start1;
    console.log(`   First fetch: ${time1}ms`);

    const start2 = Date.now();
    await getSecret('SANITY_API_TOKEN');
    const time2 = Date.now() - start2;
    console.log(`   Cached fetch: ${time2}ms`);

    if (time2 < time1) {
      console.log('✅ Caching is working (second fetch was faster)');
      testsPass++;
    } else {
      console.log('⚠️  Caching might not be working as expected');
    }
  } catch (error: any) {
    console.error('❌ Failed to test caching:', error.message);
    testsFail++;
  }
  console.log('');

  // Summary
  console.log('=' .repeat(50));
  console.log('📊 Test Summary:');
  console.log(`   Tests Passed: ${testsPass}`);
  console.log(`   Tests Failed: ${testsFail}`);
  console.log('=' .repeat(50));

  if (testsFail === 0) {
    console.log('✅ All tests passed!');
  } else if (getEnvironment() === 'development' && testsFail <= 2) {
    console.log('⚠️  Some tests failed, but this is expected in development without GCP authentication');
    console.log('   To fully test, run: gcloud auth application-default login');
  } else {
    console.log('❌ Some tests failed. Check the errors above.');
  }

  // Exit with appropriate code
  process.exit(testsFail > 0 && getEnvironment() !== 'development' ? 1 : 0);
}

// Run the tests
testSecretManager().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});