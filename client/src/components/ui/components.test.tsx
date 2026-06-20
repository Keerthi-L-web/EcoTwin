import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardTitle } from '../components/ui/Card';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDefined();
  });

  it('shows loading spinner', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByText('Loading').closest('button')).toHaveProperty('disabled', true);
  });

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled').closest('button')).toHaveProperty('disabled', true);
  });
});

describe('Input Component', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeDefined();
  });

  it('shows error message', () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByText('Required')).toBeDefined();
  });

  it('sets aria-invalid when error is present', () => {
    render(<Input label="Test" error="Error" />);
    expect(screen.getByLabelText('Test').getAttribute('aria-invalid')).toBe('true');
  });
});

describe('Card Component', () => {
  it('renders children', () => {
    render(<Card><CardTitle>Test Card</CardTitle></Card>);
    expect(screen.getByText('Test Card')).toBeDefined();
  });
});
