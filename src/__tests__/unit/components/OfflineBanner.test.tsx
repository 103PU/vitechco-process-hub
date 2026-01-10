import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OfflineBanner } from '@/components/OfflineBanner';

describe('OfflineBanner Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should not render when online', () => {
    const { container } = render(
      <OfflineBanner isOnline={true} pendingSyncCount={0} />
    );
    
    expect(container).toBeEmptyDOMElement();
  });

  it('should render when offline', () => {
    render(
      <OfflineBanner isOnline={false} pendingSyncCount={0} />
    );
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Không có kết nối mạng')).toBeInTheDocument();
  });

  it('should display pending sync count', () => {
    render(
      <OfflineBanner isOnline={false} pendingSyncCount={5} />
    );
    
    expect(screen.getByText(/5 thay đổi sẽ được đồng bộ/)).toBeInTheDocument();
  });

  it('should not display sync count when zero', () => {
    render(
      <OfflineBanner isOnline={false} pendingSyncCount={0} />
    );
    
    expect(screen.queryByText(/thay đổi sẽ được đồng bộ/)).not.toBeInTheDocument();
  });

  it('should dismiss banner when close button clicked', () => {
    const { container } = render(
      <OfflineBanner isOnline={false} pendingSyncCount={3} />
    );
    
    const closeButton = screen.getByRole('button', { name: 'Đóng thông báo' });
    fireEvent.click(closeButton);
    
    // Banner should be gone
    expect(container).toBeEmptyDOMElement();
    
    // Dismissal should be stored
    expect(localStorage.getItem('offline-banner-dismissed')).toBe('true');
  });

  it('should persist dismissal state', () => {
    // Set dismissal in localStorage
    localStorage.setItem('offline-banner-dismissed', 'true');
    
    const { container } = render(
      <OfflineBanner isOnline={false} pendingSyncCount={2} />
    );
    
    // Should not render
    expect(container).toBeEmptyDOMElement();
  });

  it('should clear dismissal when coming back online', () => {
    localStorage.setItem('offline-banner-dismissed', 'true');
    
    const { rerender } = render(
      <OfflineBanner isOnline={false} pendingSyncCount={0} />
    );
    
    // Go online
    rerender(<OfflineBanner isOnline={true} pendingSyncCount={0} />);
    
    // Dismissal should be cleared
    expect(localStorage.getItem('offline-banner-dismissed')).toBeNull();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <OfflineBanner isOnline={false} pendingSyncCount={3} />
    );
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    
    const closeButton = screen.getByRole('button', { name: 'Đóng thông báo' });
    expect(closeButton).toBeInTheDocument();
  });

  it('should show WifiOff icon', () => {
    const { container } = render(
      <OfflineBanner isOnline={false} pendingSyncCount={0} />
    );
    
    // Icon should be present (as SVG)
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  describe('localStorage interactions', () => {
    it('should handle missing localStorage gracefully', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('localStorage not available');
      });

      const { container } = render(
        <OfflineBanner isOnline={false} pendingSyncCount={1} />
      );
      
      const closeButton = screen.getByRole('button', { name: 'Đóng thông báo' });
      
      // Should not throw
      expect(() => fireEvent.click(closeButton)).not.toThrow();

      localStorage.setItem = originalSetItem;
    });
  });
});
