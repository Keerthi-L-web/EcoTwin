import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4" aria-hidden="true">🌱</div>
          <h1 className="text-3xl font-bold gradient-text">EcoTwin AI</h1>
          <p className="text-surface-200/70 mt-2">Reset your password</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {!submitted ? (
            <>
              <h2 className="text-xl font-semibold text-surface-50 mb-2">Forgot Password?</h2>
              <p className="text-sm text-surface-200/60 mb-6">
                Enter your email address and we'll generate a password reset link for you.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
                <Button type="submit" className="w-full" isLoading={loading} size="lg">
                  Generate Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <span className="text-4xl block mb-4" aria-hidden="true">✅</span>
              <h2 className="text-xl font-semibold text-surface-50 mb-2">Reset Link Generated!</h2>
              {resetLink ? (
                <>
                  <p className="text-sm text-surface-200/60 mb-4">
                    Click the link below to reset your password. This link expires in 1 hour.
                  </p>
                  <a
                    href={resetLink}
                    className="block w-full p-3 rounded-xl bg-eco-500/10 border border-eco-500/20 text-eco-400 text-sm break-all hover:bg-eco-500/20 transition-colors"
                  >
                    {resetLink}
                  </a>
                  <Button
                    className="w-full mt-4"
                    onClick={() => window.open(resetLink, '_self')}
                  >
                    Click to Reset Password →
                  </Button>
                </>
              ) : (
                <p className="text-sm text-surface-200/60">
                  If that email address is registered, a reset link has been generated.
                </p>
              )}
            </div>
          )}

          <p className="text-center text-sm text-surface-200/60 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-eco-400 hover:text-eco-300 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
