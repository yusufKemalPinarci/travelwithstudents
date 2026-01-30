import Button from './Button.tsx'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function SocialLoginButtons() {
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    // SIMULATED GOOGLE LOGIN
    // In a real app, this would open a popup or redirect to Google OAuth
    // Since we don't have OAuth credentials, we'll simulate a successful login
    // with a mock Google user.
    
    // Prompt for demo (optional, can just use hardcoded)
    const email = prompt("Enter simulated Google email for demo:", "google_user@gmail.com");
    if(!email) return;

    const result = await loginWithGoogle({
        email: email,
        name: email.split('@')[0], // Use part of email as name
        googleId: "mock_google_id_" + Date.now(),
        avatar: "https://lh3.googleusercontent.com/a/default-user"
    });

    if (result.success && result.user) {
        if (result.user.role === 'STUDENT_GUIDE') {
            navigate('/guide');
        } else {
            navigate('/');
        }
    } else {
        alert(result.message || "Google login failed");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Button variant="ghost" className="w-full border bg-white" onClick={handleGoogleLogin}>
        <span className="text-sm">Google</span>
      </Button>
      <Button variant="ghost" className="w-full border bg-white" type="button">
        <span className="text-sm">Facebook</span>
      </Button>
    </div>
  )
}
