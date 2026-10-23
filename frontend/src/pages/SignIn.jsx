import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { GraduationCap, MailCheck } from 'lucide-react';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { Input } from '../components/Field';
import { useApp } from '../context/AppContext';
import { sendOtp, verifyOtp } from '../services/api';

export default function SignIn() {
  const { user, signIn } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  const submitEmail = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await sendOtp(email.trim());
      setStep('code');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await verifyOtp(email.trim(), code);
      signIn(res.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-8 pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo size="lg" /></div>
        <div className="rounded-[2.5rem] border-[1.5px] border-ink/80 bg-white p-6 shadow-pop sm:p-8">
          {step === 'email' ? (
            <form onSubmit={submitEmail} className="space-y-5">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-[1.5px] border-ink/80 bg-sky-tint">
                <GraduationCap size={28} />
              </span>
              <div>
                <h1 className="text-3xl font-extrabold">Sign in with your college email</h1>
                <p className="mt-2 text-ink-soft">We send a 6-digit code. No passwords to remember.</p>
              </div>
              <Input
                label="College email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                required
              />
              <Button type="submit" size="lg" className="w-full" disabled={busy || !email}>
                {busy ? 'Sending code…' : 'Send my code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={submitCode} className="space-y-5">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-[1.5px] border-ink/80 bg-mint-tint">
                <MailCheck size={28} />
              </span>
              <div>
                <h1 className="text-3xl font-extrabold">Check your inbox</h1>
                <p className="mt-2 text-ink-soft">
                  We sent a code to <span className="font-bold text-ink">{email}</span>.
                </p>
              </div>
              <Input
                label="6-digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl font-bold tracking-[0.5em]"
                error={error}
                hint="Demo mode: any 6 digits will work."
                autoFocus
              />
              <Button type="submit" size="lg" className="w-full" disabled={busy || code.length !== 6}>
                {busy ? 'Checking…' : 'Sign in'}
              </Button>
              <button type="button" onClick={() => { setStep('email'); setCode(''); setError(''); }} className="w-full text-sm font-bold text-ink-soft hover:text-ink">
                Use a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
