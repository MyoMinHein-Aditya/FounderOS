import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge', () => {
  it('renders the label correctly', () => {
    render(<Badge label="Test Label" status="completed" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with completed styles', () => {
    const { container } = render(<Badge label="Done" status="completed" />);
    const span = container.firstChild;
    expect(span).toHaveClass('bg-primary/10');
  });

  it('renders with default styles when status is unknown', () => {
    const { container } = render(<Badge label="Unknown" status="unknown" />);
    const span = container.firstChild;
    expect(span).toHaveClass('bg-secondary');
  });

  it('renders icon if provided', () => {
    render(<Badge label="Icon Badge" icon={<span data-testid="icon">icon</span>} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
