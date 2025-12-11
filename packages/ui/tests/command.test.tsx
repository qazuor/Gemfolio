import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '../src/components/command';

describe('Command', () => {
  describe('rendering', () => {
    it('should render command', () => {
      render(
        <Command data-testid="command">
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results</CommandEmpty>
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId('command')).toBeInTheDocument();
    });
  });

  describe('Command', () => {
    it('should have default classes', () => {
      render(
        <Command data-testid="command">
          <CommandInput placeholder="Search..." />
        </Command>
      );

      expect(screen.getByTestId('command')).toHaveClass('flex');
    });

    it('should merge custom className', () => {
      render(
        <Command className="custom-command" data-testid="command">
          <CommandInput placeholder="Search..." />
        </Command>
      );

      expect(screen.getByTestId('command')).toHaveClass('custom-command');
    });
  });

  describe('CommandInput', () => {
    it('should render input', () => {
      render(
        <Command>
          <CommandInput placeholder="Search..." />
        </Command>
      );

      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });

    it('should render search icon', () => {
      render(
        <Command>
          <CommandInput placeholder="Search..." />
        </Command>
      );

      const input = screen.getByPlaceholderText('Search...');
      const wrapper = input.closest('div');
      expect(wrapper?.querySelector('svg')).toBeInTheDocument();
    });

    it('should merge custom className', () => {
      render(
        <Command>
          <CommandInput placeholder="Search..." className="custom-input" />
        </Command>
      );

      expect(screen.getByPlaceholderText('Search...')).toHaveClass('custom-input');
    });

    it('should update value on typing', async () => {
      const user = userEvent.setup();
      render(
        <Command>
          <CommandInput placeholder="Search..." />
        </Command>
      );

      const input = screen.getByPlaceholderText('Search...');
      await user.type(input, 'test');

      expect(input).toHaveValue('test');
    });
  });

  describe('CommandList', () => {
    it('should render list', () => {
      render(
        <Command>
          <CommandList data-testid="list">
            <CommandItem>Item 1</CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId('list')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(
        <Command>
          <CommandList data-testid="list">
            <CommandItem>Item 1</CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId('list')).toHaveClass('max-h-[300px]');
    });

    it('should merge custom className', () => {
      render(
        <Command>
          <CommandList className="custom-list" data-testid="list">
            <CommandItem>Item 1</CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId('list')).toHaveClass('custom-list');
    });
  });

  describe('CommandEmpty', () => {
    it('should render empty state', () => {
      render(
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found</CommandEmpty>
          </CommandList>
        </Command>
      );

      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  describe('CommandGroup', () => {
    it('should render group', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup heading="Suggestions" data-testid="group">
              <CommandItem>Item 1</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId('group')).toBeInTheDocument();
    });

    it('should render heading', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup heading="Suggestions">
              <CommandItem>Item 1</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      expect(screen.getByText('Suggestions')).toBeInTheDocument();
    });

    it('should merge custom className', () => {
      render(
        <Command>
          <CommandList>
            <CommandGroup className="custom-group" data-testid="group">
              <CommandItem>Item 1</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId('group')).toHaveClass('custom-group');
    });
  });

  describe('CommandItem', () => {
    it('should render item', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Test Item</CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('should call onSelect when clicked', async () => {
      const user = userEvent.setup();
      const handleSelect = vi.fn();
      render(
        <Command>
          <CommandList>
            <CommandItem onSelect={handleSelect}>Test Item</CommandItem>
          </CommandList>
        </Command>
      );

      await user.click(screen.getByText('Test Item'));

      expect(handleSelect).toHaveBeenCalled();
    });

    it('should merge custom className', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem className="custom-item" data-testid="item">
              Item
            </CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId('item')).toHaveClass('custom-item');
    });

    it('should support disabled state', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem disabled data-testid="item">
              Disabled Item
            </CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId('item')).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('CommandSeparator', () => {
    it('should render separator', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>Item 1</CommandItem>
            <CommandSeparator data-testid="separator" />
            <CommandItem>Item 2</CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(
        <Command>
          <CommandList>
            <CommandSeparator data-testid="separator" />
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId('separator')).toHaveClass('h-px');
    });

    it('should merge custom className', () => {
      render(
        <Command>
          <CommandList>
            <CommandSeparator className="custom-separator" data-testid="separator" />
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId('separator')).toHaveClass('custom-separator');
    });
  });

  describe('CommandShortcut', () => {
    it('should render shortcut', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>
              Copy
              <CommandShortcut>⌘C</CommandShortcut>
            </CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByText('⌘C')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>
              Copy
              <CommandShortcut data-testid="shortcut">⌘C</CommandShortcut>
            </CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId('shortcut')).toHaveClass('ml-auto');
      expect(screen.getByTestId('shortcut')).toHaveClass('text-xs');
    });

    it('should merge custom className', () => {
      render(
        <Command>
          <CommandList>
            <CommandItem>
              Copy
              <CommandShortcut className="custom-shortcut" data-testid="shortcut">
                ⌘C
              </CommandShortcut>
            </CommandItem>
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId('shortcut')).toHaveClass('custom-shortcut');
    });
  });

  describe('filtering', () => {
    it('should filter items based on input', async () => {
      const user = userEvent.setup();
      render(
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results</CommandEmpty>
            <CommandGroup>
              <CommandItem value="apple">Apple</CommandItem>
              <CommandItem value="banana">Banana</CommandItem>
              <CommandItem value="cherry">Cherry</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const input = screen.getByPlaceholderText('Search...');
      await user.type(input, 'app');

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeVisible();
      });
    });
  });
});
