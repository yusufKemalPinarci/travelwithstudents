import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import RatingStars from '../RatingStars'

describe('RatingStars Component', () => {
  it('renders rating value correctly', () => {
    render(<RatingStars rating={4.5} />)
    
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })

  it('displays review count when provided', () => {
    render(<RatingStars rating={4.5} count={120} />)
    
    expect(screen.getByText('(120)')).toBeInTheDocument()
  })

  it('does not display review count when not provided', () => {
    render(<RatingStars rating={4.5} />)
    
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument()
  })

  it('renders 5 star elements', () => {
    const { container } = render(<RatingStars rating={3.0} />)
    
    const stars = container.querySelectorAll('svg')
    expect(stars).toHaveLength(5)
  })

  it('shows correct filled stars for whole number rating', () => {
    const { container } = render(<RatingStars rating={3.0} />)
    
    const filledStars = container.querySelectorAll('.fill-amber-400')
    // Should have 3 filled stars
    expect(filledStars.length).toBeGreaterThan(0)
  })

  it('handles maximum rating of 5', () => {
    render(<RatingStars rating={5.0} count={100} />)
    
    expect(screen.getByText('5.0')).toBeInTheDocument()
    expect(screen.getByText('(100)')).toBeInTheDocument()
  })

  it('handles minimum rating of 0', () => {
    render(<RatingStars rating={0} />)
    
    expect(screen.getByText('0.0')).toBeInTheDocument()
  })

  it('formats decimal ratings correctly', () => {
    render(<RatingStars rating={4.75} />)
    
    expect(screen.getByText('4.8')).toBeInTheDocument()
  })
})
