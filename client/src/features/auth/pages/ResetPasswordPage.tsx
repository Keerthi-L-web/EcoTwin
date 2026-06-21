import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../lib/api';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token. Please request a new link.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to reset password. The link may have expired.');
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
          <p className="text-surface-200/70 mt-2">Choose your new password</p>
        </div>

        <div className="glass rounded-2xl p-8">
          {success ? (
            <div className="text-center">
              <span className="text-4xl block mb-4" aria-hidden="true">🎉</span>
              <h2 className="text-xl font-semibold text-eco-400 mb-2">Password Reset!</h2>
              <p className="text-sm text-surface-200/60">
                Your password has been updated successfully. Redirecting you to login...
              </p>
              <Link to="/login" className="block mt-4 text-eco-400 hover:text-eco-300 font-medium text-sm">
                Go to Login →
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-surface-50 mb-2">Set New Password</h2>
              <p className="text-sm text-surface-200/60 mb-6">
                Enter and confirm your new password below.
              </p>

              {!token && (
                <div className="mb-4 p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm" role="alert">
                  ⚠️ Invalid reset link. Please go back and request a new one.
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  required
                  autoComplete="new-password"
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  required
                  autoComplete="new-password"
                />

                {/* Password strength hints */}
                {password.length > 0 && (
                  <ul className="space-y-1 text-xs">
                    <li className={password.length >= 8 ? 'text-eco-400' : 'text-surface-200/50'}>
                      {password.length >= 8 ? '✓' : '○'} At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(password) ? 'text-eco-400' : 'text-surface-200/50'}>
                      {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                    </li>
                    <li className={/[0-9]/.test(password) ? 'text-eco-400' : 'text-surface-200/50'}>
                      {/[0-9]/.test(password) ? '✓' : '○'} One number
                    </li>
                  </ul>
                )}

                <Button type="submit" className="w-full" isLoading={loading} size="lg" disabled={!token}>
                  Reset Password
                </Button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-surface-200/60 mt-6">
            <Link to="/forgot-password" className="text-eco-400 hover:text-eco-300 font-medium">
              Request a new reset link
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
