import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain an uppercase letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain a number');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, name);
      navigate('/profile');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
      const msg = axiosErr.response?.data?.error || axiosErr.response?.data?.message;
      if (msg?.toLowerCase().includes('already')) {
        setError('This email is already registered. Please sign in instead.');
      } else if (msg?.toLowerCase().includes('invalid')) {
        setError('Invalid email or password format. Please check your input.');
      } else {
        setError(msg || 'Signup failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4" aria-hidden="true">🌱</div>
          <h1 className="text-3xl font-bold gradient-text">Join EcoTwin AI</h1>
          <p className="text-surface-200/70 mt-2">Start your sustainability journey</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-surface-50 mb-6">Create Account</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              required
              autoComplete="new-password"
            />
            <Button type="submit" className="w-full" isLoading={loading} size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-surface-200/60 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-eco-400 hover:text-eco-300 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
