import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/ui/empty-state';
import { FileQuestion, Search, FolderOpen } from 'lucide-react';

describe('EmptyState Component', () => {
  it('should render with title and description', () => {
    render(
      <EmptyState
        title="No results found"
        description="Try adjusting your search"
      />
    );

    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search')).toBeInTheDocument();
  });

  it('should render with custom icon', () => {
    render(
      <EmptyState
        icon={Search}
        title="Start searching"
      />
    );

    const container = screen.getByText('Start searching').closest('div');
    expect(container).toBeInTheDocument();
  });

  it('should render without description', () => {
    render(
      <EmptyState title="Empty state" />
    );

    expect(screen.getByText('Empty state')).toBeInTheDocument();
    expect(screen.queryByText('Try adjusting your search')).not.toBeInTheDocument();
  });

  it('should render with action button', () => {
    const handleAction = vi.fn();
    
    render(
      <EmptyState
        title="No documents"
        description="Create your first document"
      >
        <button onClick={handleAction}>Create Document</button>
      </EmptyState>
    );

    const button = screen.getByRole('button', { name: 'Create Document' });
    expect(button).toBeInTheDocument();
    
    button.click();
    expect(handleAction).toHaveBeenCalledOnce();
  });

  it('should use default icon when none provided', () => {
    render(
      <EmptyState title="Default icon test" />
    );

    // Component should still render
    expect(screen.getByText('Default icon test')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <EmptyState
        title="Custom class"
        className="custom-empty-state"
      />
    );

    const element = container.querySelector('.custom-empty-state');
    expect(element).toBeInTheDocument();
  });

  describe('Different use cases', () => {
    it('should render search empty state', () => {
      render(
        <EmptyState
          icon={Search}
          title="Không tìm thấy kết quả"
          description="Thử điều chỉnh từ khóa tìm kiếm"
        />
      );

      expect(screen.getByText('Không tìm thấy kết quả')).toBeInTheDocument();
    });

    it('should render document empty state', () => {
      render(
        <EmptyState
          icon={FolderOpen}
          title="Chưa có tài liệu"
          description="Tạo tài liệu đầu tiên của bạn"
        >
          <button onClick={() => { }}>Tạo tài liệu</button>
        </EmptyState>
      );

      expect(screen.getByRole('button', { name: 'Tạo tài liệu' })).toBeInTheDocument();
    });
  });
});
