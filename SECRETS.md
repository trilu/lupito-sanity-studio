# Secrets Configuration

## Service: Lupito Sanity Studio
## Last Audit: 2025-09-19
## Compliant: ✅ Yes

### Secrets Used:

| Secret Name | Purpose | Environment | Rotation Schedule | Last Rotated |
|------------|---------|-------------|-------------------|--------------|
| SANITY_API_TOKEN_STG | Sanity Studio API Access | Staging | 180 days | 2025-09-19 |
| SANITY_API_TOKEN_PROD | Sanity Studio API Access | Production | 90 days | 2025-09-19 |
| SUPABASE_SERVICE_KEY_STG | Supabase Backend Access | Staging | 180 days | 2025-09-19 |
| SUPABASE_SERVICE_KEY_PROD | Supabase Backend Access | Production | 90 days | 2025-09-19 |
| UNSPLASH_ACCESS_KEY_STG | Unsplash API for Images | Staging | 180 days | 2025-09-19 |
| UNSPLASH_ACCESS_KEY_PROD | Unsplash API for Images | Production | 90 days | 2025-09-19 |

### Access:
- Service Account: sanity-studio@careful-drummer-468512-p0.iam.gserviceaccount.com
- IAM Roles: secretmanager.secretAccessor
- Project ID: careful-drummer-468512-p0

### Compliance Status:
- [x] No hardcoded secrets
- [x] Using Secret Manager
- [x] Proper naming convention
- [x] Access logging enabled
- [x] Rotation schedule defined
- [x] .gitignore includes .env files
- [x] Secret Manager integration module created

### Implementation Details:

#### Secret Manager Module
- Location: `/lib/secrets-manager.ts`
- Features:
  - Automatic environment detection (dev/staging/prod)
  - Secret caching (5-minute TTL)
  - Fallback to local .env for development
  - Batch secret fetching
  - Error handling and logging

#### Usage Example:
```typescript
import { getSecret, getSecrets } from './lib/secrets-manager';

// Fetch single secret
const apiToken = await getSecret('SANITY_API_TOKEN');

// Fetch multiple secrets
const secrets = await getSecrets([
  'SANITY_API_TOKEN',
  'SUPABASE_SERVICE_KEY',
  'UNSPLASH_ACCESS_KEY'
]);
```

### Migration Status:
- [x] Removed all hardcoded API keys
- [x] Installed @google-cloud/secret-manager package
- [x] Created Secret Manager integration module
- [x] Updated .gitignore to exclude .env files
- [x] Documented secret naming conventions

### Environment Configuration:

#### Production (Cloud Run/Vercel)
- Automatic authentication via service account
- Secrets accessed directly from Secret Manager
- No environment variables needed

#### Local Development
1. **Option 1 (Recommended):** Use Google Cloud credentials
   ```bash
   gcloud auth application-default login
   ```

2. **Option 2:** Use service account key
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   ```

3. **Option 3 (Temporary):** Use .env.local for development
   - Create .env.local with development values
   - Never commit this file

### Monitoring:
- Secret access logged in Google Cloud Audit Logs
- Alerts configured for:
  - Failed secret access attempts
  - Unusual access patterns
  - Secrets approaching rotation date

### Next Rotation Dates:
- Production secrets: 2025-12-19 (90 days)
- Staging secrets: 2026-03-19 (180 days)

### Notes:
- All secrets follow naming convention: `{SERVICE}_{KEY_TYPE}_{ENVIRONMENT}`
- Claude/Anthropic integration completely removed (using Sanity AI Assist instead)
- Secrets are project-specific and isolated by environment