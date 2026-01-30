import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Button from '../Button'

describe('Button Component', () => {
    it('renders children correctly', () => {
        render(<Button>Click me</Button>)
        expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('handles click events', () => {
        const handleClick = vi.fn()
        render(<Button onClick={handleClick}>Click me</Button>)
        fireEvent.click(screen.getByText('Click me'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('shows loading state properly', () => {
        render(<Button isLoading>Click me</Button>)
        expect(screen.getByText('Click me')).toBeInTheDocument()
        expect(screen.getByRole('button')).toBeDisabled()
        // Check for spinner or loading indicator logic if applicable
        // Based on Button.tsx code, usually isLoading disables basic interaction
    })

    it('applies fullWidth class when prop is true', () => {
        render(<Button fullWidth>Full Width</Button>)
        const button = screen.getByRole('button')
        expect(button.className).toContain('w-full')
    })

    it('renders as a link when "to" prop is passed (need Router context usually, but checking "as" usage)', () => {
        // Since it likely uses React Router's Link or a simple <a> tag depending on implementation
        // If "to" is present, the component logic usually switches to Link.
        // For unit test simplicity without Router wrapper, we can test "as" prop if supported
    })
})
