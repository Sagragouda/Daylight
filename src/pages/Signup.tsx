import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { GoogleButton } from '../components/auth/GoogleButton';
import { Button } from '../components/common/Button';
import { Mail, Lock, User as UserIcon, AlertCircle, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export const Signup: React.FC = () => {
  const { user, signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verificationRequired, setVerificationRequired] = useState(false);

  // If already signed in, redirect to dashboard
  useEffect(() => {
    if (user && !verificationRequired) {
      navigate('/', { replace: true });
    }
  }, [user, navigate, verificationRequired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Form Validations
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter them carefully.');
      return;
    }

    try {
      setLoading(true);
      const { error, needsEmailVerification } = await signUpWithEmail(
        email,
        password,
        fullName
      );

      if (error) {
        if (error.message.toLowerCase().includes('user already registered')) {
          setErrorMsg('An account with this email address already exists. Please sign in instead.');
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      if (needsEmailVerification) {
        setVerificationRequired(true);
      } else {
        // Auto-confirmed accounts log straight in
        navigate('/', { replace: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during sign up.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  // If email confirmation screen needs to be shown
  if (verificationRequired) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle="A confirmation link has been sent to activate your Daylight account."
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-[#0071e3] border border-blue-100 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#1d1d1f]">
              Confirmation email sent to:
            </p>
            <p className="text-xs font-mono font-medium text-[#0071e3] bg-blue-50/80 px-3 py-1.5 rounded-xl border border-blue-100/70 inline-block mt-1">
              {email}
            </p>
          </div>

          <p className="text-xs text-[#6e6e73] leading-relaxed max-w-sm mx-auto">
            Please click the confirmation link in the email to verify your address. Once verified, you can sign in to your workspace.
          </p>

          <div className="pt-2">
            <Link to="/login">
              <Button variant="primary" size="md" className="w-full">
                <span>Go to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Begin your journey towards calm focus and deliberate daily progress."
    >
      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span className="leading-relaxed">{errorMsg}</span>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Name Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <UserIcon className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              required
              autoFocus
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Morgan"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-black/[0.08] bg-[#fbfbfd] text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-black/[0.08] bg-[#fbfbfd] text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5">
            Password (min. 6 characters)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-black/[0.08] bg-[#fbfbfd] text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
            />
          </div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-black/[0.08] bg-[#fbfbfd] text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          className="w-full h-11 text-sm font-semibold shadow-md mt-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-black/[0.06]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-[#86868b] uppercase tracking-wider text-[10px]">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google OAuth Button */}
      <GoogleButton label="Sign up with Google" onError={(msg) => setErrorMsg(msg)} />

      {/* Login Link */}
      <div className="mt-5 pt-4 border-t border-black/[0.05] text-center text-xs text-[#6e6e73]">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-[#0071e3] hover:underline">
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};
