import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import GuideProfileEditor from '../GuideProfileEditor'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'

// Mock useNavigate
const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => navigateMock
    }
})

describe('GuideProfileEditor Validations', () => {
  it('Bio Length Validation: Submit is disabled and error shown when bio is too short', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
            <GuideProfileEditor />
        </AuthProvider>
      </BrowserRouter>
    )

    // Find Bio Textarea
    const bioInput = screen.getByLabelText(/About Me \/ Bio \*/i)
    
    // Type a short bio
    fireEvent.change(bioInput, { target: { value: 'Hi there' } })

    // Assert: Check if a validation error is displayed regarding the 150-character limit.
    // Logic in component: {isBioLengthValid ? (...) : `Minimum 150 characters required.`}
    expect(screen.getByText(/Minimum 150 characters required/i)).toBeInTheDocument()

    // Assert: Check if the submit button is Disabled
    // Button text is "Save Changes"
    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    expect(saveButton).toBeDisabled()
    
    // Make it valid to verify toggle
    const longBio = "A".repeat(151)
    fireEvent.change(bioInput, { target: { value: longBio } })
    
    // Error should be gone
    expect(screen.queryByText(/Minimum 150 characters required/i)).not.toBeInTheDocument()
    expect(screen.getByText(/Great length!/i)).toBeInTheDocument()
    
    // Button should be enabled (assuming University is set? No, University defaults to something? 
    // Checking logic: disabled={!isBioLengthValid || (isOtherUni && !customUni.trim())}
    // University default is empty? 
    // Defaults: const [university, setUniversity] = useState('Uva'); // Wait, I need to check defaults in the file.
    // If university is empty, logic doesn't explicitly disable save unless isOtherUni logic handles it.
    // But let's check ONLY the Bio logic for now or provide university.
    
    // I will check if saveButton is enabled. If it fails, I'll know unrelated fields are blocking.
    // Based on my read of the component earlier, I didn't see explicit disable for empty university unless it's "Other".
    // But let's stick to checking the Validation Message which is the primary request.
  })
})
