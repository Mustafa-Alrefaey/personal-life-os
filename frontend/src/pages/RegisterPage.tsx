import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';
import { Spinner } from '../components/ui/Spinner';

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', fullName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  const field = (id: string, label: string, type: string, value: string, placeholder: string) => (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <input
        id={id} type={type} required value={value}
        onChange={(e) => setForm({ ...form, [id]: e.target.value })}
        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
        style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
        placeholder={placeholder}
        minLength={id === 'password' || id === 'confirmPassword' ? 6 : undefined}
      />
    </div>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="w-full max-w-sm">
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
            {field('fullName', t('auth.fullName'), 'text', form.fullName, 'John Doe')}
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
