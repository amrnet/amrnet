# 🔐 Environment Variables Security Guide

## ⚠️ CRITICAL SECURITY NOTICE

**NEVER commit `.env` files with real credentials to git!**

## 📋 Required Setup

### 1. Copy the example file

```bash
cp .env.example .env
```

### 2. Update with your actual credentials

Edit `.env` and replace placeholder values:

- MongoDB connection string
- API keys
- Production URLs

### 3. Verify .gitignore

Ensure `.env` files are ignored:

```bash
git status
# Should NOT show .env files
```

## 🔧 Environment Files Structure

```text
.env.example          # Template with placeholder values (COMMIT THIS)
.env                  # Local development (NEVER COMMIT)
.env.local            # Local overrides (NEVER COMMIT)
.env.development      # Development environment (NEVER COMMIT)
.env.production       # Production environment (NEVER COMMIT)
.env.test            # Test environment (NEVER COMMIT)
```

## 🌍 Environment-Specific Configuration

### Development

```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017
REACT_APP_API_URL=http://localhost:8080
```

### Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/...
REACT_APP_API_URL=https://api.yourdomain.com
```

### Testing

```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/test_db
REACT_APP_API_URL=http://localhost:8080
```

## 🔒 MongoDB Security Best Practices

1. **Create dedicated database users** with minimal permissions
2. **Use environment-specific clusters** (dev/staging/prod)
3. **Enable IP whitelisting** in MongoDB Atlas
4. **Rotate credentials regularly**
5. **Use MongoDB connection string encryption**

## 🚨 If Credentials Were Exposed

1. **Immediately rotate MongoDB credentials**
2. **Check MongoDB Atlas access logs**
3. **Update all environments with new credentials**
4. **Remove files from git history**:

   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch .env*' \
   --prune-empty --tag-name-filter cat -- --all
   ```

## 📚 Deployment Configuration

### Heroku

```bash
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set NODE_ENV=production
```

### Vercel

Add environment variables in Vercel dashboard or:

```bash
vercel env add MONGODB_URI
```

### Docker

```yaml
# docker-compose.yml
environment:
  - MONGODB_URI=${MONGODB_URI}
  - NODE_ENV=${NODE_ENV}
```

## ✅ Security Checklist

- [ ] `.env` files are in `.gitignore`
- [ ] No credentials in code or config files
- [ ] MongoDB user has minimal permissions
- [ ] IP restrictions configured in MongoDB Atlas
- [ ] Different credentials for each environment
- [ ] Regular credential rotation schedule
- [ ] Environment variables documented in `.env.example`
