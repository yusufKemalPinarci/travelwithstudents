import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import InputField from '../InputField'

describe('InputField Component', () => {
    it('renders label correctly', () => {
        render(<InputField label="Email Address" />)
        expect(screen.getByText('Email Address')).toBeInTheDocument()
    })

    it('handles text input', () => {
        const handleChange = vi.fn()
        render(<InputField label="Username" onChange={handleChange} />)
        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: 'testuser' } })
        expect(handleChange).toHaveBeenCalled()
    })

    it('displays error message when provided', () => {
        render(<InputField label="Password" error="Password is required" />)
        expect(screen.getByText('Password is required')).toBeInTheDocument()
        const input = screen.getByRole('textbox')
        expect(input.className).toContain('border-red-300')
    })
})
