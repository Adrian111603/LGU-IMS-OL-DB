import { FormEvent, useState } from 'react';
import { Database } from 'lucide-react';
import { useAuth } from './auth-context';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand-mark"><Database size={26} /></div>
        <h1>LGU IMS Online Database</h1>
        <p>Secure exchange center for exported IMS packages.</p>
        <form onSubmit={handleSubmit} className="stack">
          <label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required /></label>
          <label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required /></label>
          {error && <div className="error">{error}</div>}
          <button type="submit">Sign in</button>
        </form>
      </section>
    </main>
  );
}

