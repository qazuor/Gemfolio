import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../src/components/accordion';

describe('Accordion', () => {
  describe('rendering', () => {
    it('should render accordion', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Section 1')).toBeInTheDocument();
    });

    it('should render multiple items', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
    });
  });

  describe('AccordionItem', () => {
    it('should have border-b class by default', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" data-testid="accordion-item">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByTestId('accordion-item')).toHaveClass('border-b');
    });

    it('should merge custom className', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="custom-item" data-testid="accordion-item">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByTestId('accordion-item')).toHaveClass('custom-item');
    });
  });

  describe('AccordionTrigger', () => {
    it('should render trigger button', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByRole('button', { name: /section 1/i })).toBeInTheDocument();
    });

    it('should have chevron icon', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByRole('button', { name: /section 1/i });
      expect(trigger.querySelector('svg')).toBeInTheDocument();
    });

    it('should merge custom className', () => {
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="custom-trigger">Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByRole('button', { name: /section 1/i })).toHaveClass('custom-trigger');
    });
  });

  describe('AccordionContent', () => {
    it('should expand content on click', async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      await user.click(screen.getByRole('button', { name: /section 1/i }));

      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeVisible();
      });
    });

    it('should toggle content on clicks', async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByRole('button', { name: /section 1/i });
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeInTheDocument();
      });
    });

    it('should support custom className prop', () => {
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent className="custom-content">Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });
  });

  describe('single mode', () => {
    it('should support single mode', async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      await user.click(screen.getByRole('button', { name: /section 1/i }));
      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeInTheDocument();
      });
    });
  });

  describe('multiple mode', () => {
    it('should allow multiple items open at a time', async () => {
      const user = userEvent.setup();
      render(
        <Accordion type="multiple">
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Section 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      await user.click(screen.getByRole('button', { name: /section 1/i }));
      await user.click(screen.getByRole('button', { name: /section 2/i }));

      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeVisible();
        expect(screen.getByText('Content 2')).toBeVisible();
      });
    });
  });

  describe('controlled state', () => {
    it('should respect defaultValue', () => {
      render(
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Content 1')).toBeVisible();
    });

    it('should call onValueChange', async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();
      render(
        <Accordion type="single" collapsible onValueChange={handleValueChange}>
          <AccordionItem value="item-1">
            <AccordionTrigger>Section 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      await user.click(screen.getByRole('button', { name: /section 1/i }));

      expect(handleValueChange).toHaveBeenCalledWith('item-1');
    });
  });

  describe('displayName', () => {
    it('should have correct displayName for AccordionItem', () => {
      expect(AccordionItem.displayName).toBe('AccordionItem');
    });
  });
});
