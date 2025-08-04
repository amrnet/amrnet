# Fixie SOCKS5 Proxy Configuration for MongoDB Atlas

## Overview
This application now supports Fixie SOCKS5 proxy for secure MongoDB Atlas connections when deployed on Heroku. This provides enhanced security by routing database connections through a dedicated proxy service.

## How It Works

### Automatic Detection
The application automatically detects if the `FIXIE_URL` environment variable is present and configures the MongoDB connection accordingly:

- **With Fixie**: All MongoDB connections are routed through the SOCKS5 proxy
- **Without Fixie**: Direct connections to MongoDB Atlas (development/local)

### Configuration
The MongoDB client options are centrally managed in `config/db.js` via the `getMongoClientOptions()` function:

```javascript
// Parses FIXIE_URL: socks5://username:password@proxy-host:port
if (process.env.FIXIE_URL) {
  const fixieUrl = new URL(process.env.FIXIE_URL);
  options.proxyHost = fixieUrl.hostname;
  options.proxyPort = parseInt(fixieUrl.port, 10);
  options.proxyUsername = fixieUrl.username;
  options.proxyPassword = fixieUrl.password;
}
```

## Files Updated

### Core Configuration
- `config/db.js` - Central MongoDB client configuration with Fixie support
- `Procfile` - Heroku deployment configuration

### API Routes
- `routes/api/api.js` - Main API endpoints
- `routes/api/optimized.js` - Optimized queries endpoint

### Scripts
- `scripts/heroku-atlas-optimizer.js` - Heroku/Atlas performance optimization
- `scripts/organism-performance-debugger.js` - Database performance debugging

### Client Configuration
- `client/src/constants.js` - Dynamic API endpoint configuration

## Heroku Environment Variables

### Required Variables
```bash
# Fixie SOCKS5 Proxy (automatically added by Fixie add-on)
FIXIE_URL=socks5://username:password@proxy-host:port

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# Application Configuration
NODE_ENV=production
REACT_APP_API_URL=https://your-app-name.herokuapp.com/api/
```

### Setting Environment Variables
```bash
# If not automatically set by Fixie add-on, manually set:
heroku config:set FIXIE_URL="socks5://username:password@proxy-host:port" --app your-app-name

# MongoDB and app configuration:
heroku config:set MONGODB_URI="your-mongodb-connection-string" --app your-app-name
heroku config:set NODE_ENV=production --app your-app-name
heroku config:set REACT_APP_API_URL="https://your-app-name.herokuapp.com/api/" --app your-app-name
```

## Security Benefits

1. **IP Whitelisting**: MongoDB Atlas can whitelist only Fixie's IP addresses
2. **Encrypted Tunnel**: All database traffic is encrypted through the SOCKS5 proxy
3. **Connection Pooling**: Fixie provides connection pooling and management
4. **DDoS Protection**: Additional layer of protection against attacks

## Troubleshooting

### Connection Issues
Check the logs for proxy configuration:
```bash
heroku logs --tail --app your-app-name
```

Look for these log messages:
- ✅ `"Configuring MongoDB connection with Fixie SOCKS5 proxy..."`
- ✅ `"MongoDB connection established via Fixie SOCKS5 proxy"`
- ❌ `"Failed to parse FIXIE_URL, proceeding without proxy"`

### Testing Connection
Use the built-in optimizer script:
```bash
heroku run node scripts/heroku-atlas-optimizer.js --app your-app-name
```

### Common Issues
1. **FIXIE_URL not set**: Add-on not properly installed
2. **Connection timeout**: Check MongoDB Atlas IP whitelist
3. **Authentication failed**: Verify MongoDB credentials

## Development vs Production

### Local Development
- No Fixie proxy (direct connection to Atlas)
- Uses `REACT_APP_API_URL=http://localhost:8080/api/`

### Production (Heroku)
- Automatic Fixie proxy detection and configuration
- Uses `REACT_APP_API_URL=https://your-app-name.herokuapp.com/api/`

## Monitoring

The application provides detailed logging for connection status:
- Proxy configuration details
- Connection success/failure
- Performance metrics via optimizer scripts

## Next Steps

1. Verify Fixie add-on is installed: `heroku addons --app your-app-name`
2. Check environment variables: `heroku config --app your-app-name`
3. Monitor connection logs: `heroku logs --tail --app your-app-name`
4. Run performance tests: `heroku run node scripts/heroku-atlas-optimizer.js --app your-app-name`
