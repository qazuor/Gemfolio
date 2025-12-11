import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tag, tagVariants } from '../src/primitives/tag';

describe('Tag', () => {
  describe('rendering', () => {
    it('should render tag with children', () => {
      render(<Tag>Test Tag</Tag>);
      expect(screen.getByText('Test Tag')).toBeInTheDocument();
    });

    it('should render tag with label prop', () => {
      render(<Tag label="Label Tag" />);
      expect(screen.getByText('Label Tag')).toBeInTheDocument();
    });

    it('should prefer label over children', () => {
      render(<Tag label="Label">Children</Tag>);
      expect(screen.getByText('Label')).toBeInTheDocument();
      expect(screen.queryByText('Children')).not.toBeInTheDocument();
    });

    it('should render as span element', () => {
      render(<Tag data-testid="tag">Tag</Tag>);
      expect(screen.getByTestId('tag').tagName).toBe('SPAN');
    });
  });

  describe('variants', () => {
    it('should apply default variant classes', () => {
      render(<Tag data-testid="tag">Default</Tag>);
      const tag = screen.getByTestId('tag');
      expect(tag).toHaveClass('bg-gray-100');
    });

    it('should apply new variant classes', () => {
      render(
        <Tag variant="new" data-testid="tag">
          New
        </Tag>
      );
      const tag = screen.getByTestId('tag');
      expect(tag).toHaveClass('bg-blue-100');
      expect(tag).toHaveClass('text-blue-800');
    });

    it('should apply sale variant classes', () => {
      render(
        <Tag variant="sale" data-testid="tag">
          Sale
        </Tag>
      );
      const tag = screen.getByTestId('tag');
      expect(tag).toHaveClass('bg-red-100');
      expect(tag).toHaveClass('text-red-800');
    });

    it('should apply featured variant classes', () => {
      render(
        <Tag variant="featured" data-testid="tag">
          Featured
        </Tag>
      );
      const tag = screen.getByTestId('tag');
      expect(tag).toHaveClass('bg-purple-100');
      expect(tag).toHaveClass('text-purple-800');
    });

    it('should apply exclusive variant classes', () => {
      render(
        <Tag variant="exclusive" data-testid="tag">
          Exclusive
        </Tag>
      );
      const tag = screen.getByTestId('tag');
      expect(tag).toHaveClass('bg-amber-100');
      expect(tag).toHaveClass('text-amber-800');
    });
  });

  describe('custom className', () => {
    it('should merge custom className with default classes', () => {
      render(
        <Tag className="custom-tag" data-testid="tag">
          Tag
        </Tag>
      );
      const tag = screen.getByTestId('tag');
      expect(tag).toHaveClass('custom-tag');
      expect(tag).toHaveClass('inline-flex');
    });
  });

  describe('default classes', () => {
    it('should have inline-flex class', () => {
      render(<Tag data-testid="tag">Tag</Tag>);
      expect(screen.getByTestId('tag')).toHaveClass('inline-flex');
    });

    it('should have items-center class', () => {
      render(<Tag data-testid="tag">Tag</Tag>);
      expect(screen.getByTestId('tag')).toHaveClass('items-center');
    });

    it('should have rounded-md class', () => {
      render(<Tag data-testid="tag">Tag</Tag>);
      expect(screen.getByTestId('tag')).toHaveClass('rounded-md');
    });

    it('should have text-xs class', () => {
      render(<Tag data-testid="tag">Tag</Tag>);
      expect(screen.getByTestId('tag')).toHaveClass('text-xs');
    });

    it('should have font-medium class', () => {
      render(<Tag data-testid="tag">Tag</Tag>);
      expect(screen.getByTestId('tag')).toHaveClass('font-medium');
    });
  });

  describe('tagVariants', () => {
    it('should generate correct class string for default variant', () => {
      const classes = tagVariants();
      expect(classes).toContain('bg-gray-100');
      expect(classes).toContain('text-gray-800');
    });

    it('should generate correct class string for new variant', () => {
      const classes = tagVariants({ variant: 'new' });
      expect(classes).toContain('bg-blue-100');
      expect(classes).toContain('text-blue-800');
    });

    it('should generate correct class string for sale variant', () => {
      const classes = tagVariants({ variant: 'sale' });
      expect(classes).toContain('bg-red-100');
      expect(classes).toContain('text-red-800');
    });

    it('should generate correct class string for featured variant', () => {
      const classes = tagVariants({ variant: 'featured' });
      expect(classes).toContain('bg-purple-100');
      expect(classes).toContain('text-purple-800');
    });

    it('should generate correct class string for exclusive variant', () => {
      const classes = tagVariants({ variant: 'exclusive' });
      expect(classes).toContain('bg-amber-100');
      expect(classes).toContain('text-amber-800');
    });
  });

  describe('HTML attributes', () => {
    it('should pass through HTML attributes', () => {
      render(
        <Tag data-testid="tag" title="Tag title">
          Tag
        </Tag>
      );
      expect(screen.getByTestId('tag')).toHaveAttribute('title', 'Tag title');
    });

    it('should pass through data attributes', () => {
      render(
        <Tag data-testid="tag" data-custom="value">
          Tag
        </Tag>
      );
      expect(screen.getByTestId('tag')).toHaveAttribute('data-custom', 'value');
    });
  });
});
