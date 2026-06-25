import { FormEvent, useState } from 'react';
import { AlertCircle, Database, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from './auth-context';

type LoginErrors = {
  email?: string;
  password?: string;
};

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});

  function validateEmail(value = email) {
    const trimmedEmail = value.trim();
    if (!trimmedEmail) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return 'Enter a valid email address.';
    return undefined;
  }

  function validatePassword(value = password) {
    if (!value) return 'Password is required.';
    if (value.length < 6) return 'Password must be at least 6 characters.';
    return undefined;
  }

  function validate() {
    const nextErrors: LoginErrors = {
      email: validateEmail(),
      password: validatePassword()
    };
    const cleanErrors = Object.fromEntries(
      Object.entries(nextErrors).filter(([, value]) => Boolean(value))
    ) as LoginErrors;

    setFieldErrors(cleanErrors);
    return Object.keys(cleanErrors).length === 0;
  }

  function validateField(field: keyof LoginErrors) {
    if (field === 'email') {
      setFieldErrors((current) => ({ ...current, email: validateEmail() }));
    } else {
      setFieldErrors((current) => ({ ...current, password: validatePassword() }));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-copy">
        <div className="login-badge"><ShieldCheck size={18} /> Authorized personnel only</div>
        <h1>LGU IMS Online Database</h1>
        <p>Securely move, review, and track IMS packages between municipal offices and barangays.</p>
        <div className="login-highlights">
          <span>Package tracking</span>
          <span>Audit history</span>
          <span>Role-based access</span>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-panel-header">
          <div className="brand-mark"><Database size={26} /></div>
          <div>
            <span className="eyebrow">Secure sign in</span>
            <h2>Welcome back</h2>
          </div>
        </div>
        <p>Enter your account credentials to continue to the IMS exchange dashboard.</p>
        <form onSubmit={handleSubmit} className="stack" noValidate>
          <label className={fieldErrors.email ? 'invalid' : ''}>
            Email address
            <span className="input-icon">
              <Mail size={17} />
              <input
                autoComplete="email"
                value={email}
                onBlur={() => validateField('email')}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFieldErrors((current) => ({ ...current, email: undefined }));
                }}
                placeholder="name@lgu.gov.ph"
                type="email"
              />
            </span>
            {fieldErrors.email && <small>{fieldErrors.email}</small>}
          </label>
          <label className={fieldErrors.password ? 'invalid' : ''}>
            Password
            <span className="input-icon password-field">
              <LockKeyhole size={17} />
              <input
                autoComplete="current-password"
                value={password}
                onBlur={() => validateField('password')}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setFieldErrors((current) => ({ ...current, password: undefined }));
                }}
                placeholder="Enter your password"
                type={showPassword ? 'text' : 'password'}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
            {fieldErrors.password && <small>{fieldErrors.password}</small>}
          </label>
          {error && <div className="error"><AlertCircle size={18} /> {error}</div>}
          <button className="button full" disabled={loading} type="submit">{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
      </section>
    </main>
  );
}
