import { render, screen } from '@testing-library/react';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('renders correctly with given percentage', () => {
    const { container } = render(<ProgressBar percentage={50} />);
    const fill = container.querySelector('.progress-fill');
    expect(fill).toHaveStyle('width: 50%');
  });

  it('displays label when provided', () => {
    render(<ProgressBar percentage={30} label="Loading" />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('displays percentage text when showPercent is true', () => {
    render(<ProgressBar percentage={75.6} showPercent={true} />);
    expect(screen.getByText('76%')).toBeInTheDocument();
  });
});
