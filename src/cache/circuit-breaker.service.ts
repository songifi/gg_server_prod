/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  HealthIndicator, // Use HealthIndicator here
  HealthIndicatorResult, // To handle the result of the health check
} from '@nestjs/terminus'; // Correct import
import { Redis } from 'ioredis'; // Redis client (you need to install ioredis)

@Injectable()
export class CircuitBreakerService {
  private breakerState: Map<
    string,
    {
      failures: number;
      lastFailure: Date;
      isOpen: boolean;
    }
  > = new Map();

  private threshold = 5; // Failures before opening circuit
  private resetTimeout = 30000; // 30 seconds to reset

  constructor(
    private health: HealthCheckService,
    private redis: Redis, // Inject your Redis client (ioredis)
  ) {}

  @HealthCheck()
  async checkRedisHealth() {
    try {
      await this.health.check([
        () => this.redisHealthCheck(), // Use a custom Redis health check function
      ]);
      return true; // Return true when health check succeeds
    } catch (e) {
      return false;
    }
  }

  // Custom Redis health check using HealthIndicator
  private async redisHealthCheck(): Promise<HealthIndicatorResult> {
    try {
      const response = await this.redis.ping(); // Use the Redis `ping` command
      if (response === 'PONG') {
        return { redis: { status: 'up' } }; // Indicating Redis is healthy
      }
      throw new Error('Redis ping failed');
    } catch (error) {
      throw new Error('Redis is down'); // If Redis is not reachable, throw error
    }
  }

  async isCircuitClosed(service: string): Promise<boolean> {
    if (!this.breakerState.has(service)) {
      this.breakerState.set(service, {
        failures: 0,
        lastFailure: new Date(),
        isOpen: false,
      });
      return true;
    }

    const state = this.breakerState.get(service);

    // Check if circuit is open and if enough time has passed to try again
    if (state.isOpen) {
      const now = new Date();
      if (now.getTime() - state.lastFailure.getTime() > this.resetTimeout) {
        // Half-open circuit to test if service recovered
        state.isOpen = false;
        return true;
      }
      return false;
    }

    return true;
  }

  recordSuccess(service: string): void {
    if (this.breakerState.has(service)) {
      const state = this.breakerState.get(service);
      state.failures = 0;
      state.isOpen = false;
    }
  }

  recordFailure(service: string): void {
    if (!this.breakerState.has(service)) {
      this.breakerState.set(service, {
        failures: 1,
        lastFailure: new Date(),
        isOpen: false,
      });
      return;
    }

    const state = this.breakerState.get(service);
    state.failures += 1;
    state.lastFailure = new Date();

    if (state.failures >= this.threshold) {
      state.isOpen = true;
    }
  }
}
