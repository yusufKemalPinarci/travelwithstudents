import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SearchBar from '../SearchBar'

describe('SearchBar Component', () => {
  it('renders with default placeholder', () => {
    const handleSearch = vi.fn()
    render(<SearchBar onSearch={handleSearch} />)
    
    const input = screen.getByPlaceholderText('Search for guides or cities')
    expect(input).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    const handleSearch = vi.fn()
    render(<SearchBar placeholder="Custom placeholder" onSearch={handleSearch} />)
    
    const input = screen.getByPlaceholderText('Custom placeholder')
    expect(input).toBeInTheDocument()
  })

  it('calls onSearch when typing in input', () => {
    const handleSearch = vi.fn()
    render(<SearchBar onSearch={handleSearch} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Istanbul' } })
    
    expect(handleSearch).toHaveBeenCalledWith('Istanbul')
  })

  it('renders search button', () => {
    const handleSearch = vi.fn()
    render(<SearchBar onSearch={handleSearch} />)
    
    const button = screen.getByRole('button', { name: /search/i })
    expect(button).toBeInTheDocument()
  })

  it('displays search icon', () => {
    const handleSearch = vi.fn()
    const { container } = render(<SearchBar onSearch={handleSearch} />)
    
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('handles empty search input', () => {
    const handleSearch = vi.fn()
    render(<SearchBar onSearch={handleSearch} />)
    
    const input = screen.getByRole('textbox')
    // First type something
    fireEvent.change(input, { target: { value: 'test' } })
    expect(handleSearch).toHaveBeenCalledWith('test')
    
    // Then clear it
    fireEvent.change(input, { target: { value: '' } })
    expect(handleSearch).toHaveBeenCalledWith('')
  })
})
