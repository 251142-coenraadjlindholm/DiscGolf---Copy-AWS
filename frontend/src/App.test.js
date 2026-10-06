import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Disc Golf South Africa homepage', () => {
  render(<App />);
  const heading = screen.getByRole('heading', {
    name: /Disc Golf South Africa/i,
    level: 1,
  });
  expect(heading).toBeInTheDocument();
});
