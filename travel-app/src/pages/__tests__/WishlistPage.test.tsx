import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import WishlistPage from '../WishlistPage'
import { AuthProvider } from '../../context/AuthContext'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderWishlistPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <WishlistPage />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('WishlistPage', () => {
  it('renders page title', () => {
    renderWishlistPage()
    
    expect(screen.getByText('My Wishlist')).toBeInTheDocument()
  })

  it('shows empty state when wishlist is empty', () => {
    renderWishlistPage()
    
    expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument()
    expect(screen.getByText(/Explore the world and save your favorite/)).toBeInTheDocument()
  })

  it('displays start exploring button in empty state', () => {
    renderWishlistPage()
    
    const exploreButton = screen.getByText('Start Exploring')
    expect(exploreButton).toBeInTheDocument()
  })

  it('navigates to home when start exploring is clicked', () => {
    renderWishlistPage()
    
    const exploreButton = screen.getByText('Start Exploring')
    fireEvent.click(exploreButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('shows empty heart icon in empty state', () => {
    const { container } = renderWishlistPage()
    
    const heartIcon = container.querySelector('.text-slate-300')
    expect(heartIcon).toBeInTheDocument()
  })

  // Note: Testing with items would require setting up wishlist state
  // which would need proper context mocking or integration test
})
