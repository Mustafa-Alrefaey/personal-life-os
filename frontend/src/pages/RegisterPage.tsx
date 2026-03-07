import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';
import { Spinner } from '../components/ui/Spinner';
import { RamadanBanner } from '../components/ui/RamadanBanner';

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', fullName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const isRTL = i18n.language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError(t('auth.passwordMismatch')); return; }
    setLoading(true);
    try {
      const result = await authService.register(form);
      if (result.success && result.data) {
        setUser({ email: result.data.email, fullName: result.data.fullName, token: result.data.token });
        navigate('/dashboard');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch {
      setError(t('auth.serverError'));
    } finally {
      setLoading(false);
    }
  };

  const eyeIcon = (visible: boolean) => visible ? (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/></svg>
  ) : (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
  );

  const field = (id: string, label: string, type: string, value: string, placeholder: string) => {
    const isPasswordField = id === 'password' || id === 'confirmPassword';
    const visible = id === 'password' ? showPassword : id === 'confirmPassword' ? showConfirm : false;
    const toggleVisible = id === 'password' ? () => setShowPassword(!showPassword) : id === 'confirmPassword' ? () => setShowConfirm(!showConfirm) : undefined;
    const inputType = isPasswordField ? (visible ? 'text' : 'password') : type;

    return (
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
        <div className="relative">
          <input
            id={id} type={inputType} required value={value}
            onChange={(e) => setForm({ ...form, [id]: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
            style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', ...(isPasswordField ? { paddingInlineEnd: '2.5rem' } : {}) }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
            placeholder={placeholder}
            minLength={isPasswordField ? 6 : undefined}
          />
          {isPasswordField && (
            <button
              type="button"
              onClick={toggleVisible}
              className="absolute inset-y-0 end-0 flex items-center pe-3"
              style={{ color: 'var(--text-muted)' }}
              tabIndex={-1}
            >
              {eyeIcon(visible)}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="w-full max-w-sm">
        <RamadanBanner />
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4"
            style={{ background: 'var(--accent)' }}
          >
            PL
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {t('auth.appName')}
          </h1>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}
        >
          <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>{t('auth.register')}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {field('fullName', t('auth.fullName'), 'text', form.fullName, 'your name')}
            {field('email', t('auth.email'), 'email', form.email, 'you@example.com')}
            {field('password', t('auth.password'), 'password', form.password, '••••••••')}
            {field('confirmPassword', t('auth.confirmPassword'), 'password', form.confirmPassword, '••••••••')}

            {error && (
              <div className="text-sm rounded-lg px-3 py-2.5" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: 'var(--danger)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? <><Spinner size="sm" />{t('auth.creatingAccount')}</> : t('auth.register')}
            </button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
              {t('auth.loginLink')}
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <button onClick={() => i18n.changeLanguage(isRTL ? 'en' : 'ar')} className="text-xs font-medium hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
            {isRTL ? 'English' : 'العربية'}
          </button>
        </div>
      </div>
    </div>
  );
}
