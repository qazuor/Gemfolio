import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../src/components/table';

describe('Table', () => {
  describe('Table component', () => {
    it('should render table', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(
        <Table data-testid="table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByTestId('table');
      expect(table).toHaveClass('w-full');
      expect(table).toHaveClass('caption-bottom');
      expect(table).toHaveClass('text-sm');
    });

    it('should be wrapped in overflow container', () => {
      render(
        <Table data-testid="table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByTestId('table');
      const wrapper = table.parentElement;
      expect(wrapper).toHaveClass('relative');
      expect(wrapper).toHaveClass('w-full');
      expect(wrapper).toHaveClass('overflow-auto');
    });

    it('should merge custom className', () => {
      render(
        <Table data-testid="table" className="custom-class">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByTestId('table');
      expect(table).toHaveClass('custom-class');
      expect(table).toHaveClass('w-full');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(
        <Table ref={ref}>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLTableElement);
    });
  });

  describe('TableHeader component', () => {
    it('should render thead', () => {
      render(
        <Table>
          <TableHeader data-testid="header">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      expect(screen.getByTestId('header').tagName).toBe('THEAD');
    });

    it('should have default classes', () => {
      render(
        <Table>
          <TableHeader data-testid="header">
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('[&_tr]:border-b');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(
        <Table>
          <TableHeader ref={ref}>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('TableBody component', () => {
    it('should render tbody', () => {
      render(
        <Table>
          <TableBody data-testid="body">
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('body').tagName).toBe('TBODY');
    });

    it('should have default classes', () => {
      render(
        <Table>
          <TableBody data-testid="body">
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const body = screen.getByTestId('body');
      expect(body).toHaveClass('[&_tr:last-child]:border-0');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(
        <Table>
          <TableBody ref={ref}>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('TableFooter component', () => {
    it('should render tfoot', () => {
      render(
        <Table>
          <TableFooter data-testid="footer">
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
      expect(screen.getByTestId('footer').tagName).toBe('TFOOT');
    });

    it('should have default classes', () => {
      render(
        <Table>
          <TableFooter data-testid="footer">
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('border-t');
      expect(footer).toHaveClass('bg-muted/50');
      expect(footer).toHaveClass('font-medium');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(
        <Table>
          <TableFooter ref={ref}>
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('TableRow component', () => {
    it('should render tr', () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-testid="row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('row').tagName).toBe('TR');
    });

    it('should have default classes', () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-testid="row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const row = screen.getByTestId('row');
      expect(row).toHaveClass('border-b');
      expect(row).toHaveClass('transition-colors');
      expect(row).toHaveClass('hover:bg-muted/50');
    });

    it('should apply selected state class', () => {
      render(
        <Table>
          <TableBody>
            <TableRow data-testid="row" data-state="selected">
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const row = screen.getByTestId('row');
      expect(row).toHaveClass('data-[state=selected]:bg-muted');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(
        <Table>
          <TableBody>
            <TableRow ref={ref}>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('TableHead component', () => {
    it('should render th', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="head">Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      expect(screen.getByTestId('head').tagName).toBe('TH');
    });

    it('should have default classes', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="head">Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      const head = screen.getByTestId('head');
      expect(head).toHaveClass('h-10');
      expect(head).toHaveClass('px-2');
      expect(head).toHaveClass('text-left');
      expect(head).toHaveClass('font-medium');
      expect(head).toHaveClass('text-muted-foreground');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead ref={ref}>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('TableCell component', () => {
    it('should render td', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell data-testid="cell">Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByTestId('cell').tagName).toBe('TD');
    });

    it('should have default classes', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell data-testid="cell">Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const cell = screen.getByTestId('cell');
      expect(cell).toHaveClass('p-2');
      expect(cell).toHaveClass('align-middle');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell ref={ref}>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('TableCaption component', () => {
    it('should render caption', () => {
      render(
        <Table>
          <TableCaption data-testid="caption">Table Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText('Table Caption')).toBeInTheDocument();
      expect(screen.getByTestId('caption').tagName).toBe('CAPTION');
    });

    it('should have default classes', () => {
      render(
        <Table>
          <TableCaption data-testid="caption">Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const caption = screen.getByTestId('caption');
      expect(caption).toHaveClass('mt-4');
      expect(caption).toHaveClass('text-sm');
      expect(caption).toHaveClass('text-muted-foreground');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(
        <Table>
          <TableCaption ref={ref}>Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('composed Table', () => {
    it('should render full table with all components', () => {
      render(
        <Table>
          <TableCaption>Table caption</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell>jane@example.com</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total: 2 users</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );

      expect(screen.getByText('Table caption')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Total: 2 users')).toBeInTheDocument();
    });
  });
});
