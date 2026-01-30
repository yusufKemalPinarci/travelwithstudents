import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PaginationControls from '../PaginationControls'

describe('PaginationControls Component', () => {
  it('renders current page and total pages', () => {
    const handlePageChange = vi.fn()
    render(<PaginationControls page={2} totalPages={5} onPageChange={handlePageChange} />)
    
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument()
  })

  it('renders previous and next buttons', () => {
    const handlePageChange = vi.fn()
    render(<PaginationControls page={2} totalPages={5} onPageChange={handlePageChange} />)
    
    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    const handlePageChange = vi.fn()
    render(<PaginationControls page={1} totalPages={5} onPageChange={handlePageChange} />)
    
    const prevButton = screen.getByText('Previous')
    expect(prevButton).toBeDisabled()
  })

  it('disables next button on last page', () => {
    const handlePageChange = vi.fn()
    render(<PaginationControls page={5} totalPages={5} onPageChange={handlePageChange} />)
    
    const nextButton = screen.getByText('Next')
    expect(nextButton).toBeDisabled()
  })

  it('calls onPageChange with previous page when previous is clicked', () => {
    const handlePageChange = vi.fn()
    render(<PaginationControls page={3} totalPages={5} onPageChange={handlePageChange} />)
    
    const prevButton = screen.getByText('Previous')
    fireEvent.click(prevButton)
    
    expect(handlePageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with next page when next is clicked', () => {
    const handlePageChange = vi.fn()
    render(<PaginationControls page={3} totalPages={5} onPageChange={handlePageChange} />)
    
    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)
    
    expect(handlePageChange).toHaveBeenCalledWith(4)
  })

  it('enables both buttons on middle pages', () => {
    const handlePageChange = vi.fn()
    render(<PaginationControls page={3} totalPages={5} onPageChange={handlePageChange} />)
    
    const prevButton = screen.getByText('Previous')
    const nextButton = screen.getByText('Next')
    
    expect(prevButton).not.toBeDisabled()
    expect(nextButton).not.toBeDisabled()
  })

  it('handles single page correctly', () => {
    const handlePageChange = vi.fn()
    render(<PaginationControls page={1} totalPages={1} onPageChange={handlePageChange} />)
    
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
    
    const prevButton = screen.getByText('Previous')
    const nextButton = screen.getByText('Next')
    
    expect(prevButton).toBeDisabled()
    expect(nextButton).toBeDisabled()
  })
})
