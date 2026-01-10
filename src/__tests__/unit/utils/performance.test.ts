import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    measurePerformance,
    trackRender,
    measureFPS,
    logMemoryUsage
} from '@/lib/utils/performance';

describe('Performance Utilities', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(console, 'log').mockImplementation(() => { });
        vi.spyOn(console, 'warn').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('measurePerformance', () => {
        it('should measure sync function execution time', async () => {
            const fn = vi.fn(() => 'result');

            const result = await measurePerformance(fn, 'test-sync');

            expect(result).toBe('result');
            expect(fn).toHaveBeenCalledOnce();
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('[Performance] test-sync:'),
                expect.stringContaining('ms')
            );
        });

        it('should measure async function execution time', async () => {
            const asyncFn = vi.fn(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                return 'async-result';
            });

            const promise = measurePerformance(asyncFn, 'test-async');
            vi.advanceTimersByTime(100);
            const result = await promise;

            expect(result).toBe('async-result');
            expect(asyncFn).toHaveBeenCalledOnce();
        });

        it('should handle function errors', async () => {
            const errorFn = vi.fn(() => {
                throw new Error('Test error');
            });

            await expect(measurePerformance(errorFn, 'test-error'))
                .rejects
                .toThrow('Test error');
        });

        it('should work without label', async () => {
            const fn = vi.fn(() => 'result');
            await measurePerformance(fn, '');
            expect(fn).toHaveBeenCalled();
        });
    });

    describe('trackRender', () => {
        it('should log render information', () => {
            const renderInfo = {
                phase: 'mount' as const,
                actualDuration: 15.5,
                baseDuration: 20.0,
                startTime: 1000,
                commitTime: 1015.5
            };

            trackRender(
                'TestComponent',
                renderInfo.phase,
                renderInfo.actualDuration,
                renderInfo.baseDuration,
                renderInfo.startTime,
                renderInfo.commitTime
            );

            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('[Render] TestComponent'),
                expect.stringContaining('mount'),
                expect.objectContaining({
                    actualDuration: '15.50ms',
                    baseDuration: '20.00ms'
                })
            );
        });

        it('should handle different phases', () => {
            trackRender('TestComponent', 'update', 5, 10, 0, 5);

            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('update'),
                expect.anything()
            );
        });

        it('should warn on slow renders', () => {
            trackRender('SlowComponent', 'mount', 150, 200, 0, 150);

            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('Slow render detected'),
                expect.anything()
            );
        });
    });

    describe('measureFPS', () => {
        it('should measure frames per second', async () => {
            // Mock requestAnimationFrame
            let frameCallback: FrameRequestCallback | undefined;
            global.requestAnimationFrame = vi.fn((callback) => {
                frameCallback = callback;
                return 1;
            }) as any;

            const fpsPromise = measureFPS(1000);

            // Simulate 60 frames in 1 second
            for (let i = 0; i < 60; i++) {
                if (frameCallback) {
                    (frameCallback as FrameRequestCallback)(i * 16.67); // ~60fps
                }
            }

            vi.advanceTimersByTime(1000);

            const fps = await fpsPromise;

            expect(fps).toBeGreaterThan(0);
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('[FPS]'),
                expect.stringContaining('frames/second')
            );
        });
    });

    describe('logMemoryUsage', () => {
        it('should log memory usage when available', () => {
            // Mock performance.memory
            (performance as any).memory = {
                usedJSHeapSize: 50 * 1024 * 1024, // 50MB
                totalJSHeapSize: 100 * 1024 * 1024, // 100MB
                jsHeapSizeLimit: 2048 * 1024 * 1024 // 2GB
            };

            logMemoryUsage();

            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('[Memory]'),
                expect.objectContaining({
                    used: expect.stringContaining('MB'),
                    total: expect.stringContaining('MB')
                })
            );

            delete (performance as any).memory;
        });

        it('should handle missing performance.memory', () => {
            delete (performance as any).memory;

            logMemoryUsage();

            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('Memory API not available')
            );
        });
    });
});
