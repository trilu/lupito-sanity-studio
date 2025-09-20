# API Key Management Policy
## Standard Guidelines for All Lupito Repositories

**Version**: 1.0  
**Last Updated**: 2025-09-16  
**Status**: MANDATORY for all repositories

---

## 🔴 CRITICAL RULES - NO EXCEPTIONS

1. **NEVER hardcode API keys** in source code
2. **NEVER commit API keys** to Git repositories
3. **NEVER share API keys** in Slack, email, or documentation
4. **NEVER use production keys** in development/staging
5. **ALWAYS use Google Cloud Secret Manager** for all API keys

---

## 📋 Policy Overview

All API keys, tokens, and sensitive credentials across Lupito services MUST be stored in Google Cloud Secret Manager. This policy applies to:
- Backend services (Cloud Run, Cloud Functions)
- Frontend applications (React Native, Web)
- Admin panels and internal tools
- CI/CD pipelines
- Local development environments

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Google Cloud Secret Manager     │
│                                         │
│  Production Secrets | Staging Secrets   │
└────────────┬────────────────────────────┘
             │
             ├──────────────┬──────────────┬──────────────┐
             │              │              │              │
     ┌───────▼──────┐ ┌────▼────┐ ┌──────▼──────┐ ┌─────▼──────┐
     │ Cloud Run    │ │Frontend │ │   Admin     │ │    CI/CD   │
     │  Services    │ │  Apps   │ │   Panel     │ │  Pipelines │
     └──────────────┘ └─────────┘ └─────────────┘ └────────────┘
```

---

## 🔑 Naming Convention

All secrets MUST follow this naming pattern:

```
{SERVICE}_{KEY_TYPE}_{ENVIRONMENT}
```

### Examples:
- `X_API_KEY_STG` - API key for staging
- `X_API_KEY_PROD` - API key for production
- `OPENAI_API_KEY_STG` - OpenAI key for staging
- `SUPABASE_SERVICE_KEY_PROD` - Supabase key for production
- `STRIPE_SECRET_KEY_DEV` - Stripe key for development

### Reserved Suffixes:
- `_PROD` - Production environment
- `_STG` - Staging environment  
- `_DEV` - Development environment
- `_TEST` - Test environment

---

## 🚀 Implementation Guide

### 1. Backend Services (Cloud Run/Cloud Functions)

```python
# Python Example
import os
from google.cloud import secretmanager

def get_secret(secret_id: str, project_id: str) -> str:
    """Fetch secret from Google Cloud Secret Manager"""
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_id}/versions/latest"
    response = client.access_secret_version(request={"name": name})
    return response.payload.data.decode("UTF-8")

# Use environment variable if available, otherwise fetch from Secret Manager
API_KEY = os.getenv("X_API_KEY") or get_secret("X_API_KEY_STG", "project-id")
```

```javascript
// Node.js Example
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

async function getSecret(secretId, projectId) {
  const client = new SecretManagerServiceClient();
  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${secretId}/versions/latest`,
  });
  return version.payload.data.toString();
}

// Usage
const apiKey = process.env.X_API_KEY || await getSecret('X_API_KEY_STG', 'project-id');
```

### 2. Frontend Applications (React Native/Web)

Frontend applications MUST use the Secrets Proxy service:

```javascript
// Frontend Secrets Service
class SecretsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getSecret(secretName) {
    // Check cache first
    const cached = this.cache.get(secretName);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.value;
    }

    // Fetch from Secrets Proxy
    const response = await fetch(`${SECRETS_PROXY_URL}/api/secrets/${secretName}`, {
      headers: {
        'Authorization': `Bearer ${await getSupabaseJWT()}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch secret: ${secretName}`);
    }

    const data = await response.json();
    
    // Cache the result
    this.cache.set(secretName, {
      value: data.value,
      timestamp: Date.now()
    });

    return data.value;
  }
}

// Usage
const secretsService = new SecretsService();
const apiKey = await secretsService.getSecret('X_API_KEY_STG');
```

### 3. Local Development

For local development, use a `.env` file that is NEVER committed:

```bash
# .env.local (add to .gitignore)
X_API_KEY=dev-test-key-local-only
OPENAI_API_KEY=sk-dev-test-key
```

```python
# Python with python-dotenv
from dotenv import load_dotenv
load_dotenv('.env.local')  # Load local env file

API_KEY = os.getenv('X_API_KEY')
```

### 4. CI/CD Pipelines

```yaml
# GitHub Actions Example
steps:
  - name: Authenticate to Google Cloud
    uses: google-github-actions/auth@v1
    with:
      credentials_json: ${{ secrets.GCP_SA_KEY }}
  
  - name: Get API Key from Secret Manager
    id: secrets
    uses: google-github-actions/get-secretmanager-secrets@v1
    with:
      secrets: |-
        api-key:project-id/X_API_KEY_STG
  
  - name: Use Secret
    env:
      API_KEY: ${{ steps.secrets.outputs.api-key }}
    run: |
      # Your deployment commands
```

---

## 🛡️ Security Requirements

### Access Control
1. **Principle of Least Privilege**: Grant minimal necessary permissions
2. **Service Accounts**: Each service gets its own service account
3. **IAM Roles**: Use `secretmanager.secretAccessor` role only
4. **Audit Logging**: All secret access is logged in Cloud Audit Logs

### Secret Rotation
- **Production**: Rotate every 90 days
- **Staging**: Rotate every 180 days
- **Development**: Rotate yearly
- **Compromised Keys**: Rotate IMMEDIATELY

### Monitoring
- Set up alerts for:
  - Unauthorized access attempts
  - Unusual access patterns
  - Failed authentication
  - Secret approaching expiration

---

## 📝 Adding New Secrets

### Step 1: Create Secret in Secret Manager
```bash
# Create a new secret
echo -n "your-secret-value" | gcloud secrets create SECRET_NAME_ENV \
  --data-file=- \
  --replication-policy="automatic" \
  --project=PROJECT_ID

# Add labels for organization
gcloud secrets update SECRET_NAME_ENV \
  --update-labels=environment=staging,service=api,type=api-key
```

### Step 2: Update Secrets Proxy Allowed List
```bash
# Get current allowed list
gcloud secrets versions access latest --secret="ALLOWED_SECRETS"

# Update with new secret
echo "EXISTING_SECRETS,NEW_SECRET_NAME" | \
  gcloud secrets versions add ALLOWED_SECRETS --data-file=-
```

### Step 3: Grant Access
```bash
# Grant service account access
gcloud secrets add-iam-policy-binding SECRET_NAME_ENV \
  --member="serviceAccount:SERVICE_ACCOUNT@PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 4: Deploy Service Update
```bash
# Update Cloud Run service to use new secret
gcloud run services update SERVICE_NAME \
  --update-secrets SECRET_ENV_VAR=SECRET_NAME_ENV:latest \
  --region=REGION
```

---

## 🚫 Anti-Patterns to Avoid

### ❌ DON'T DO THIS:
```javascript
// NEVER hardcode
const API_KEY = "5d1593fb3149a13977a43f56b919169933174bfe73c40e47";

// NEVER use production keys in dev
const API_KEY = process.env.PROD_API_KEY; // in dev environment

// NEVER log secrets
console.log("Using API key:", API_KEY);

// NEVER pass secrets in URLs
fetch(`https://api.example.com?key=${API_KEY}`);
```

### ✅ DO THIS INSTEAD:
```javascript
// Fetch from Secret Manager
const API_KEY = await getSecret('X_API_KEY_STG');

// Use environment-specific keys
const API_KEY = await getSecret(`X_API_KEY_${ENV}`);

// Log safe information only
console.log("API key loaded successfully");

// Pass secrets in headers
fetch('https://api.example.com', {
  headers: { 'x-api-key': API_KEY }
});
```

---

## 🔄 Migration Checklist

When migrating existing services to use Secret Manager:

- [ ] Identify all hardcoded keys in the codebase
- [ ] Create secrets in Secret Manager with proper naming
- [ ] Update service code to fetch from Secret Manager
- [ ] Configure service accounts and IAM permissions
- [ ] Update CI/CD pipelines
- [ ] Test in staging environment
- [ ] Remove hardcoded values from code
- [ ] Update documentation
- [ ] Rotate old keys after migration
- [ ] Set up monitoring and alerts

---

## 📊 Compliance Tracking

Each repository must maintain a `SECRETS.md` file documenting:

```markdown
# Secrets Configuration

## Service: [Service Name]
## Last Audit: [Date]
## Compliant: ✅ Yes / ❌ No

### Secrets Used:
| Secret Name | Purpose | Environment | Rotation Schedule | Last Rotated |
|------------|---------|-------------|-------------------|--------------|
| X_API_KEY_STG | API Authentication | Staging | 180 days | 2025-09-16 |
| OPENAI_API_KEY_STG | AI Services | Staging | 180 days | 2025-09-16 |

### Access:
- Service Account: [service-account@project.iam.gserviceaccount.com]
- IAM Roles: secretmanager.secretAccessor

### Compliance Status:
- [x] No hardcoded secrets
- [x] Using Secret Manager
- [x] Proper naming convention
- [x] Access logging enabled
- [x] Rotation schedule defined
```

---

## 🆘 Support & Exceptions

### Getting Help
1. Check this documentation first
2. Review existing implementations in other services
3. Contact the Security Team for guidance
4. Open a ticket for Secret Manager access issues

### Exception Process
Exceptions to this policy require:
1. Written justification
2. Security team review
3. CTO approval
4. Time-limited exemption (max 30 days)
5. Migration plan to compliance

---

## 📚 Resources

- [Google Cloud Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Secrets Proxy Service Documentation](./SECRETS-PROXY-SERVICE.md)
- [Security Best Practices](https://cloud.google.com/secret-manager/docs/best-practices)
- [IAM Configuration Guide](https://cloud.google.com/secret-manager/docs/access-control)

---

## 🔖 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-09-16 | Initial policy | Backend Team |

---

**Remember**: Security is everyone's responsibility. When in doubt, ask for help rather than taking shortcuts.