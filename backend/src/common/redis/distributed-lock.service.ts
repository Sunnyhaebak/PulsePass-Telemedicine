import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { RedisService } from './redis.service';
import * as crypto from 'crypto';

@Injectable()
export class DistributedLockService {
  private readonly logger = new Logger(DistributedLockService.name);

  // Atomic Lua script ensures the lock is deleted ONLY if the value matches the lockId
  private readonly UNLOCK_LUA_SCRIPT = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

  constructor(private readonly redisService: RedisService) {}

  /**
   * Acquire a distributed lock with automatic expiration (SET NX PX)
   * @param lockKey Unique resource key (e.g. `lock:slot:s_uuid_101`)
   * @param ttlMs Time to live in milliseconds (default 5000ms)
   * @returns unique lockId if acquired, null if already locked
   */
  async acquireLock(lockKey: string, ttlMs = 5000): Promise<string | null> {
    const lockId = crypto.randomUUID();
    try {
      // 'NX' - only set the key if it does not already exist
      // 'PX' - set the specified expire time, in milliseconds
      const result = await this.redisService.client.set(lockKey, lockId, 'PX', ttlMs, 'NX');
      if (result === 'OK') {
        this.logger.debug(`Acquired distributed lock: ${lockKey} (lockId: ${lockId}, TTL: ${ttlMs}ms)`);
        return lockId;
      }
      return null;
    } catch (err) {
      this.logger.warn(`Redis lock error on ${lockKey}: ${err.message}`);
      // Fallback: If Redis is unavailable, permit continuation or enforce strict fail-safe
      return lockId;
    }
  }

  /**
   * Safely release distributed lock using atomic Lua script
   */
  async releaseLock(lockKey: string, lockId: string): Promise<boolean> {
    try {
      const result = await this.redisService.client.eval(this.UNLOCK_LUA_SCRIPT, 1, lockKey, lockId);
      const released = result === 1;
      if (released) {
        this.logger.debug(`Released distributed lock: ${lockKey}`);
      }
      return released;
    } catch (err) {
      this.logger.warn(`Failed to release lock ${lockKey}: ${err.message}`);
      return false;
    }
  }

  /**
   * Helper to execute a high-concurrency callback with automatic lock acquisition and release
   */
  async withLock<T>(lockKey: string, ttlMs = 5000, operation: () => Promise<T>): Promise<T> {
    const lockId = await this.acquireLock(lockKey, ttlMs);
    if (!lockId) {
      throw new ConflictException(`Resource is currently locked by a concurrent transaction. Please retry in a few seconds.`);
    }

    try {
      return await operation();
    } finally {
      await this.releaseLock(lockKey, lockId);
    }
  }
}
