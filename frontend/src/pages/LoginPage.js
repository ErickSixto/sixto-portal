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

  if (user) return <Navigate to="/dashboard" replace />;

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
    <div className="min-h-screen bg-oat flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo-light.png" alt="ES" className="w-16 h-16 mx-auto mb-4 rounded-xl" />
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Erick Sixto</h1>
          <p className="text-secondary text-sm mt-1">Customer Portal</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-border" data-testid="login-form">
          {step === 'email' ? (
            <>
              <h2 className="text-lg font-semibold text-charcoal mb-1">Sign in</h2>
              <p className="text-secondary text-sm mb-6">Enter your email to receive a login code</p>
              <form onSubmit={handleEmail}>
                <input
                  data-testid="email-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 border border-border rounded-xl text-charcoal placeholder-secondary/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-sm"
                />
                {error && <p data-testid="login-error" className="text-red-500 text-sm mt-2">{error}</p>}
                <button
                  data-testid="request-code-button"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 px-4 py-3 bg-accent hover:bg-accent-hover text-charcoal font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Continue'}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-charcoal mb-1">Enter your code</h2>
              <p className="text-secondary text-sm mb-4">We sent a 6-digit code to <span className="font-medium text-charcoal">{email}</span></p>

              {mockCode && (
                <div className="bg-oat border border-accent/30 rounded-xl p-4 mb-4" data-testid="mock-code-display">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-secondary mb-1">Demo Mode - Your code:</div>
                      <div className="text-2xl font-mono font-bold text-charcoal tracking-widest">{mockCode}</div>
                    </div>
                    <button onClick={copyCode} className="p-2 hover:bg-white rounded-lg transition-colors" data-testid="copy-code-button">
                      {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-secondary" />}
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
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 border border-border rounded-xl text-charcoal placeholder-secondary/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-sm text-center tracking-widest font-mono text-lg"
                />
                {error && <p data-testid="verify-error" className="text-red-500 text-sm mt-2">{error}</p>}
                <button
                  data-testid="verify-code-button"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 px-4 py-3 bg-accent hover:bg-accent-hover text-charcoal font-semibold rounded-xl transition-colors text-sm disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Sign In'}
                </button>
              </form>

              <button
                data-testid="back-to-email"
                onClick={() => { setStep('email'); setError(''); setMockCode(''); setCode(''); }}
                className="w-full mt-3 text-sm text-secondary hover:text-charcoal transition-colors"
              >
                Use a different email
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-secondary mt-6">
          Erick Sixto | Salesforce Specialist
        </p>
      </div>
    </div>
  );
}
