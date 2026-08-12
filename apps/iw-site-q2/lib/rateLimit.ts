import { NextRequest } from 'next/server'

interface RateLimitStore {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitStore>()

// Cleanup old entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of store.entries()) {
      if (now > value.resetAt) {
        store.delete(key)
      }
    }
  }, 10 * 60 * 1000)
}

function getClientIdentifier(request: NextRequest): string {
  // Try to get the real IP from various headers (set by reverse proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  
  // Fallback to a generic identifier (not ideal but better than nothing)
  return 'unknown'
}

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  limit: number
  /**
   * Time window in milliseconds
   */
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Simple in-memory rate limiter for API routes.
 * Note: This is per-instance and will reset on serverless cold starts.
 * For production, consider using a distributed store like Redis/Upstash.
 */
export function rateLimit(request: NextRequest, config: RateLimitConfig): RateLimitResult {
  const identifier = getClientIdentifier(request)
  const now = Date.now()
  
  let record = store.get(identifier)
  
  // If no record or the window has expired, create a new one
  if (!record || now > record.resetAt) {
    record = {
      count: 0,
      resetAt: now + config.windowMs,
    }
    store.set(identifier, record)
  }
  
  // Increment the count
  record.count++
  
  const success = record.count <= config.limit
  const remaining = Math.max(0, config.limit - record.count)
  
  return {
    success,
    limit: config.limit,
    remaining,
    reset: record.resetAt,
  }
}
