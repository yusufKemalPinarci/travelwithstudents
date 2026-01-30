import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Avatar from '../Avatar'

describe('Avatar Component', () => {
  it('renders initials correctly from name', () => {
    render(<Avatar name="John Doe" />)
    
    const avatar = screen.getByText('JD')
    expect(avatar).toBeInTheDocument()
  })

  it('handles single name', () => {
    render(<Avatar name="John" />)
    
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('handles three or more names', () => {
    render(<Avatar name="John Michael Doe" />)
    
    expect(screen.getByText('JM')).toBeInTheDocument()
  })

  it('applies correct size classes for small size', () => {
    const { container } = render(<Avatar name="John Doe" size="sm" />)
    
    const avatarDiv = container.querySelector('.h-8')
    expect(avatarDiv).toBeInTheDocument()
  })

  it('applies correct size classes for medium size', () => {
    const { container } = render(<Avatar name="John Doe" size="md" />)
    
    const avatarDiv = container.querySelector('.h-10')
    expect(avatarDiv).toBeInTheDocument()
  })

  it('applies correct size classes for large size', () => {
    const { container } = render(<Avatar name="John Doe" size="lg" />)
    
    const avatarDiv = container.querySelector('.h-12')
    expect(avatarDiv).toBeInTheDocument()
  })

  it('shows verification badge when verified is true', () => {
    const { container } = render(<Avatar name="John Doe" verified={true} />)
    
    // Check for CheckCircleIcon
    const verificationBadge = container.querySelector('.text-emerald-500')
    expect(verificationBadge).toBeInTheDocument()
  })

  it('does not show verification badge when verified is false', () => {
    const { container } = render(<Avatar name="John Doe" verified={false} />)
    
    const verificationBadge = container.querySelector('.text-emerald-500')
    expect(verificationBadge).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Avatar name="John Doe" className="custom-class" />)
    
    const wrapper = container.querySelector('.custom-class')
    expect(wrapper).toBeInTheDocument()
  })

  it('converts initials to uppercase', () => {
    render(<Avatar name="john doe" />)
    
    expect(screen.getByText('JD')).toBeInTheDocument()
  })
})
