// Performance monitoring middleware to track API response times
import { performance } from 'perf_hooks';

const performanceMonitor = (req, res, next) => {
  const startTime = performance.now();
  const originalSend = res.send;

  // Override the send method to capture completion time
  res.send = function(data) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    // Log performance metrics
    const logData = {
      method: req.method,
      url: req.originalUrl,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      dataSize: Buffer.byteLength(data || '', 'utf8'),
      userAgent: req.get('User-Agent') || 'Unknown'
    };

    // Color code based on performance
    let color = '\x1b[32m'; // Green for fast
    if (duration > 5000) color = '\x1b[31m'; // Red for very slow
    else if (duration > 2000) color = '\x1b[33m'; // Yellow for slow

    console.log(`${color}🚀 API Performance: ${req.method} ${req.originalUrl} - ${duration}ms - ${Math.round(logData.dataSize / 1024)}KB\x1b[0m`);

    // Log detailed info for slow requests
    if (duration > 1000) {
      console.log(`⚠️  SLOW REQUEST DETECTED:`, logData);
    }

    // Set performance headers
    res.set('X-Response-Time', `${duration}ms`);
    res.set('X-Data-Size', `${logData.dataSize}`);

    return originalSend.call(this, data);
  };

  next();
};

export default performanceMonitor;
