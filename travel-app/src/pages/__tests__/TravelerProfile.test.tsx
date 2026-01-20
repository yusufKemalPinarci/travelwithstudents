import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import TravelerProfile from '../TravelerProfile'
import { BrowserRouter } from 'react-router-dom'

// Mock useAuth
const mockUser = {
    id: 'u1',
    name: 'Test Traveler',
    role: 'Traveler'
}

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: mockUser,
        isAuthenticated: true
    })
}))

// Mock useParams
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useParams: () => ({ id: 'u1' }) // Matching user ID
    }
})

describe('TravelerProfile', () => {
  it('renders View Mode initially', () => {
    render(
        <BrowserRouter>
            <TravelerProfile />
        </BrowserRouter>
    )
    // Should see "Edit Profile" button if we are the owner
    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
    // Should see bio text (paragraph), not textarea
    expect(screen.queryByRole('textbox')).toBeNull() 
  })

  it('switches to Edit Mode when button is clicked', () => {
    render(
        <BrowserRouter>
            <TravelerProfile />
        </BrowserRouter>
    )
    
    fireEvent.click(screen.getByText('Edit Profile'))
    
    // Check for inputs
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Location')).toBeInTheDocument()
    // Bio becomes a textarea
    const textareas = document.querySelectorAll('textarea');
    expect(textareas.length).toBeGreaterThan(0);
    
    // Check for "Save Changes" and "Cancel"
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('switches back to View Mode on Cancel', () => {
    render(
        <BrowserRouter>
            <TravelerProfile />
        </BrowserRouter>
    )
    
    fireEvent.click(screen.getByText('Edit Profile'))
    fireEvent.click(screen.getByText('Cancel'))
    
    expect(screen.getByText('Edit Profile')).toBeInTheDocument()
    expect(screen.queryByText('Save Changes')).not.toBeInTheDocument()
  })

  it('updates state on input change', () => {
    render(
        <BrowserRouter>
            <TravelerProfile />
        </BrowserRouter>
    )
    
    fireEvent.click(screen.getByText('Edit Profile'))
    
    const nameInput = screen.getByLabelText('Full Name') as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'New Name' } })
    expect(nameInput.value).toBe('New Name')
  })
})
