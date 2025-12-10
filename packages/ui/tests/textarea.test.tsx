import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Textarea } from '../src/components/textarea';

describe('Textarea', () => {
  describe('rendering', () => {
    it('should render textarea', () => {
      render(<Textarea />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Textarea placeholder="Enter your message" />);
      expect(screen.getByPlaceholderText('Enter your message')).toBeInTheDocument();
    });

    it('should render with value', () => {
      render(<Textarea value="Initial content" onChange={() => {}} />);
      expect(screen.getByDisplayValue('Initial content')).toBeInTheDocument();
    });

    it('should render with defaultValue', () => {
      render(<Textarea defaultValue="Default content" />);
      expect(screen.getByDisplayValue('Default content')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should allow typing', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'Hello world');
      expect(textarea).toHaveValue('Hello world');
    });

    it('should call onChange when typing', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Textarea onChange={onChange} />);

      await user.type(screen.getByRole('textbox'), 'a');
      expect(onChange).toHaveBeenCalled();
    });

    it('should call onFocus when focused', async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();
      render(<Textarea onFocus={onFocus} />);

      await user.click(screen.getByRole('textbox'));
      expect(onFocus).toHaveBeenCalled();
    });

    it('should call onBlur when blurred', async () => {
      const user = userEvent.setup();
      const onBlur = vi.fn();
      render(<Textarea onBlur={onBlur} />);

      await user.click(screen.getByRole('textbox'));
      await user.tab();
      expect(onBlur).toHaveBeenCalled();
    });

    it('should support multiline input', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'Line 1{enter}Line 2{enter}Line 3');
      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3');
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Textarea disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should not allow typing when disabled', async () => {
      const user = userEvent.setup();
      render(<Textarea disabled />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'test');
      expect(textarea).toHaveValue('');
    });
  });

  describe('readonly state', () => {
    it('should be readonly when readOnly prop is true', () => {
      render(<Textarea readOnly />);
      expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
    });
  });

  describe('styling', () => {
    it('should have default classes', () => {
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('flex');
      expect(textarea).toHaveClass('min-h-[60px]');
      expect(textarea).toHaveClass('w-full');
      expect(textarea).toHaveClass('rounded-md');
      expect(textarea).toHaveClass('border');
      expect(textarea).toHaveClass('border-input');
      expect(textarea).toHaveClass('bg-transparent');
      expect(textarea).toHaveClass('px-3');
      expect(textarea).toHaveClass('py-2');
    });

    it('should merge custom className', () => {
      render(<Textarea data-testid="textarea" className="custom-class" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('custom-class');
      expect(textarea).toHaveClass('flex');
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref', () => {
      const ref = vi.fn();
      render(<Textarea ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLTextAreaElement);
    });
  });

  describe('HTML attributes', () => {
    it('should pass through HTML attributes', () => {
      render(<Textarea data-testid="textarea" id="my-textarea" name="message" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('id', 'my-textarea');
      expect(textarea).toHaveAttribute('name', 'message');
    });

    it('should support rows attribute', () => {
      render(<Textarea data-testid="textarea" rows={5} />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('should support cols attribute', () => {
      render(<Textarea data-testid="textarea" cols={30} />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('cols', '30');
    });

    it('should support maxLength attribute', () => {
      render(<Textarea data-testid="textarea" maxLength={100} />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('maxLength', '100');
    });

    it('should support required attribute', () => {
      render(<Textarea data-testid="textarea" required />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeRequired();
    });
  });

  describe('accessibility', () => {
    it('should be associated with label', () => {
      render(
        <>
          <label htmlFor="message">Message</label>
          <Textarea id="message" />
        </>
      );
      expect(screen.getByLabelText('Message')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Textarea aria-label="Your feedback" />);
      expect(screen.getByLabelText('Your feedback')).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Textarea data-testid="textarea" aria-describedby="help-text" />
          <span id="help-text">Enter at least 10 characters</span>
        </>
      );
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('should be focusable', async () => {
      const user = userEvent.setup();
      render(<Textarea data-testid="textarea" />);

      await user.tab();
      expect(screen.getByTestId('textarea')).toHaveFocus();
    });
  });
});
