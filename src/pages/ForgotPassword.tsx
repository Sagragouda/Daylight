import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/common/Button';
import { Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const { resetPasswordForEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await resetPasswordForEmail(email);

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while sending the reset link.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        title="Reset link sent"
        subtitle="Instructions to choose a new password have been emailed."
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <p className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              We emailed a recovery link to:
            </p>
            <p className="text-xs font-mono font-medium text-[#0071e3] dark:text-[#2997ff] bg-blue-50/80 dark:bg-blue-950/50 px-3 py-1.5 rounded-xl border border-blue-100/70 dark:border-blue-900/40 inline-block mt-1">
              {email}
            </p>
          </div>

          <p className="text-xs text-[#6e6e73] dark:text-[#98989f] leading-relaxed max-w-sm mx-auto">
            Click the secure link in the email to set your new password. If you don't see it within a couple minutes, check your spam or junk folder.
          </p>

          <div className="pt-2">
            <Link to="/login">
              <Button variant="secondary" size="md" className="w-full">
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your verified account email and we'll send you a password recovery link."
    >
      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <span className="leading-relaxed">{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6e6e73] dark:text-[#98989f] mb-1.5">
            Account email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#86868b] dark:text-[#686872] absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.1] bg-[#fbfbfd] dark:bg-[#1a1c27] text-sm text-[#1d1d1f] dark:text-[#f5f5f7] placeholder:text-[#86868b] dark:placeholder:text-[#686872] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:border-[#0071e3] transition-all"
            />
          </div>
        </div>

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
              Sending recovery link...
            </span>
          ) : (
            'Send Recovery Link'
          )}
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-black/[0.05] dark:border-white/[0.08] text-center text-xs text-[#6e6e73] dark:text-[#98989f]">
        <Link
          to="/login"
          className="font-semibold text-[#0071e3] dark:text-[#2997ff] hover:underline flex items-center justify-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Sign In</span>
        </Link>
      </div>
    </AuthLayout>
  );
};
