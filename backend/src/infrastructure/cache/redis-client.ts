import { createClient } from '@keyv/redis';

export const createRedisClient = (url: string) => createClient({ url });

export type RedisClient = ReturnType<typeof createRedisClient>;

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');
