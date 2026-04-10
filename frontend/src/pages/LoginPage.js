import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ArrowRight, Copy, Check } from 'lucide-react';

export default function LoginPage() {
  const { user, login, verify } = useAuth();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [mockCode, setMockCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (user) return <Navigate to="/projects" replace />;

  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email);
      if (res.mock_code) setMockCode(res.mock_code);
      setStep('code');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verify(email, code);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(mockCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo-dark.png" alt="ES" className="w-14 h-14 mx-auto mb-4 rounded-xl" />
          <h1 className="text-xl font-bold text-warm-50 tracking-tight">Erick Sixto</h1>
          <p className="text-warm-500 text-xs mt-1 uppercase tracking-widest">Project Portal</p>
        </div>

        <div className="bg-dark-800 rounded-2xl p-7 border border-dark-500/50" data-testid="login-form">
          {step === 'email' ? (
            <>
              <h2 className="text-base font-semibold text-warm-50 mb-1">Sign in</h2>
              <p className="text-warm-400 text-xs mb-5">Enter your email to receive a login code</p>
              <form onSubmit={handleEmail}>
                <input
                  data-testid="email-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-400 rounded-xl text-warm-50 placeholder-warm-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 text-sm"
                />
                {error && <p data-testid="login-error" className="text-red-400 text-xs mt-2">{error}</p>}
                <button
                  data-testid="request-code-button"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 px-4 py-2.5 bg-accent hover:bg-accent-light text-dark-950 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Continue'}
                  {!loading && <ArrowRight size={15} />}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-base font-semibold text-warm-50 mb-1">Enter your code</h2>
              <p className="text-warm-400 text-xs mb-4">Sent to <span className="text-warm-100">{email}</span></p>

              {mockCode && (
                <div className="bg-accent/8 border border-accent/20 rounded-xl p-3.5 mb-4" data-testid="mock-code-display">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-warm-400 mb-0.5 uppercase tracking-wider">Demo Code</div>
                      <div className="text-xl font-mono font-bold text-accent tracking-[0.2em]">{mockCode}</div>
                    </div>
                    <button onClick={copyCode} className="p-1.5 hover:bg-accent/10 rounded-lg transition-colors" data-testid="copy-code-button">
                      {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-warm-400" />}
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleVerify}>
                <input
                  data-testid="code-input"
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="6-digit code"
                  maxLength={6}
                  required
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-400 rounded-xl text-warm-50 placeholder-warm-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 text-sm text-center tracking-[0.3em] font-mono"
                />
                {error && <p data-testid="verify-error" className="text-red-400 text-xs mt-2">{error}</p>}
                <button
                  data-testid="verify-code-button"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 px-4 py-2.5 bg-accent hover:bg-accent-light text-dark-950 font-semibold rounded-xl transition-colors text-sm disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Sign In'}
                </button>
              </form>

              <button
                data-testid="back-to-email"
                onClick={() => { setStep('email'); setError(''); setMockCode(''); setCode(''); }}
                className="w-full mt-3 text-xs text-warm-500 hover:text-warm-200 transition-colors"
              >
                Use a different email
              </button>
            </>
          )}
        </div>

        <p className="text-center text-[10px] text-warm-600 mt-6 uppercase tracking-widest">
          Salesforce Specialist
        </p>
      </div>
    </div>
  );
}
