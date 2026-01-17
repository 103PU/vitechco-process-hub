/**
 * Performance Monitoring Utilities
 * 
 * Helper functions for measuring and tracking performance metrics.
 * Should only be used in development mode.
 */

const isDev = process.env.NODE_ENV === 'development';

/**
 * Measure the execution time of a function
 * 
 * @param fn - Function to measure
 * @param label - Label for logging
 * @returns The result of the function
 */
export async function measurePerformance<T>(
    fn: () => T | Promise<T>,
    label: string
): Promise<T> {
    if (!isDev) {
        return fn();
    }

    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);

    return result;
}

/**
 * Track component render time using React Profiler
 * 
 * @example
 * <Profiler id="DocumentList" onRender={trackRender}>
 *   <DocumentList />
 * </Profiler>
 */
export function trackRender(
    id: string,
    phase: 'mount' | 'update' | 'nested-update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
) {
    if (!isDev) return;

    console.log(`[Render] ${id} [${phase}]`, {
        actualDuration: `${actualDuration.toFixed(2)}ms`,
        baseDuration: `${baseDuration.toFixed(2)}ms`,
        startTime: `${startTime.toFixed(2)}ms`,
        commitTime: `${commitTime.toFixed(2)}ms`,
    });
}

/**
 * Log memory usage (browser only)
 */
export function logMemoryUsage() {
    if (!isDev || typeof window === 'undefined') return;

    // @ts-expect-error - performance.memory is Chrome-specific
    const memory = performance.memory;

    if (memory) {
        console.log('[Memory]', {
            used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
            total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
            limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
        });
    }
}

/**
 * Mark a performance measurement point
 * 
 * @param name - Unique name for the mark
 */
export function markPerformance(name: string) {
    if (!isDev || typeof window === 'undefined') return;

    performance.mark(name);
}

/**
 * Measure time between two performance marks
 * 
 * @param measureName - Name for the measurement
 * @param startMark - Start mark name
 * @param endMark - End mark name
 */
export function measureBetweenMarks(
    measureName: string,
    startMark: string,
    endMark: string
) {
    if (!isDev || typeof window === 'undefined') return;

    try {
        performance.measure(measureName, startMark, endMark);
        const measure = performance.getEntriesByName(measureName)[0];
        console.log(`[Performance] ${measureName}: ${measure.duration.toFixed(2)}ms`);
    } catch (error) {
        console.error('[Performance] Measurement failed:', error);
    }
}

/**
 * Get current FPS (frames per second)
 * Useful for detecting jank during animations/scrolling
 */
export function measureFPS(duration = 1000): Promise<number> {
    if (!isDev || typeof window === 'undefined') {
        return Promise.resolve(0);
    }

    return new Promise((resolve) => {
        let frames = 0;
        const startTime = performance.now();

        function countFrame() {
            frames++;
            const currentTime = performance.now();

            if (currentTime < startTime + duration) {
                requestAnimationFrame(countFrame);
            } else {
                const fps = Math.round((frames * 1000) / (currentTime - startTime));
                console.log(`[FPS] ${fps} frames/second`);
                resolve(fps);
            }
        }

        requestAnimationFrame(countFrame);
    });
}

/**
 * Create a performance observer for specific entry types
 * 
 * @param entryTypes - Types of entries to observe ('measure', 'navigation', etc.)
 * @param callback - Callback to handle entries
 */
export function observePerformance(
    entryTypes: string[],
    callback: (entries: PerformanceEntryList) => void
) {
    if (!isDev || typeof window === 'undefined') return;

    try {
        const observer = new PerformanceObserver((list) => {
            callback(list.getEntries());
        });

        observer.observe({ entryTypes });

        return () => observer.disconnect();
    } catch (error) {
        console.error('[Performance] Observer failed:', error);
    }
}

/**
 * Log bundle size impact
 * (Use with webpack-bundle-analyzer for detailed analysis)
 */
export function logBundleSize() {
    if (!isDev || typeof window === 'undefined') return;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    const scripts = resources
        .filter(r => r.name.endsWith('.js'))
        .reduce((total, r) => total + (r.transferSize || 0), 0);

    const styles = resources
        .filter(r => r.name.endsWith('.css'))
        .reduce((total, r) => total + (r.transferSize || 0), 0);

    console.log('[Bundle Size]', {
        scripts: `${(scripts / 1024).toFixed(2)} KB`,
        styles: `${(styles / 1024).toFixed(2)} KB`,
        total: `${((scripts + styles) / 1024).toFixed(2)} KB`,
    });
}
