'use client';

import { useEffect } from 'react';

interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
    action: () => void;
    description: string;
}

export interface UseKeyboardShortcutsOptions {
    shortcuts: KeyboardShortcut[];
    enabled?: boolean;
}

/**
 * Hook for keyboard shortcuts
 * 
 * @example
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     { key: 'k', ctrl: true, action: focusSearch, description: 'Focus search' },
 *     { key: 's', ctrl: true, action: saveDocument, description: 'Save document' }
 *   ]
 * });
 */
export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            for (const shortcut of shortcuts) {
                const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
                const metaMatch = shortcut.meta ? event.metaKey : true;
                const shiftMatch = shortcut.shift ? event.shiftKey : (!shortcut.shift || !event.shiftKey);
                const altMatch = shortcut.alt ? event.altKey : (!shortcut.alt || !event.altKey);
                const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

                if (ctrlMatch && metaMatch && shiftMatch && altMatch && keyMatch) {
                    event.preventDefault();
                    shortcut.action();
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts, enabled]);
}

/**
 * Global keyboard shortcuts for the application
 */
export function useGlobalShortcuts() {
    useKeyboardShortcuts({
        shortcuts: [
            {
                key: 'k',
                ctrl: true,
                action: () => {
                    const searchInput = document.getElementById('global-search');
                    if (searchInput) {
                        searchInput.focus();
                    }
                },
                description: 'Focus search'
            },
            {
                key: '/',
                action: () => {
                    const searchInput = document.getElementById('global-search');
                    if (searchInput) {
                        searchInput.focus();
                    }
                },
                description: 'Focus search (GitHub-style)'
            },
            {
                key: 'Escape',
                action: () => {
                    // Close all modals/dialogs
                    const closeButtons = document.querySelectorAll('[data-dismiss="modal"]');
                    closeButtons.forEach(button => {
                        if (button instanceof HTMLElement) {
                            button.click();
                        }
                    });

                    // Blur active element
                    if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                    }
                },
                description: 'Close modals/blur input'
            },
            {
                key: '?',
                shift: true,
                action: () => {
                    // Show keyboard shortcuts help
                    const event = new CustomEvent('show-shortcuts-help');
                    window.dispatchEvent(event);
                },
                description: 'Show keyboard shortcuts'
            }
        ]
    });
}

/**
 * Keyboard shortcuts for document editing
 */
export function useDocumentShortcuts(callbacks: {
    onSave?: () => void;
    onCancel?: () => void;
    onPreview?: () => void;
}) {
    useKeyboardShortcuts({
        shortcuts: [
            {
                key: 's',
                ctrl: true,
                action: () => callbacks.onSave?.(),
                description: 'Save document'
            },
            {
                key: 'Escape',
                action: () => callbacks.onCancel?.(),
                description: 'Cancel editing'
            },
            {
                key: 'p',
                ctrl: true,
                shift: true,
                action: () => callbacks.onPreview?.(),
                description: 'Preview document'
            }
        ]
    });
}
