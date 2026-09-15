'use client'

import { FormEvent, useState } from 'react'
import { ArrowUpRight, Eye, EyeOff, LockKeyhole, MoveRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('yoanybritocuba@gmail.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const { error: signInError } = await createClient().auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Email o contraseña incorrectos. Comprueba tus credenciales de administrador.')
      setLoading(false)
      return
    }
    window.location.href = '/admin'
  }

  return (
    <main className="admin-login-shell">
      <div className="admin-login-orb" />
      <a className="admin-login-brand brand" href="/">
        <span className="brand-mark">/</span>studio<span className="brand-dot">●</span>
      </a>
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="admin-login-icon">
          <LockKeyhole size={19} />
        </div>
        <p className="admin-kicker">Private workspace / Barcelona 2026</p>
        <h1 id="admin-login-title">Admin access</h1>
        <p className="admin-login-copy">Accede al centro de control para editar proyectos, imágenes, enlaces y contenido público.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </label>
          <label>
            Contraseña
            <span className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          {error && (
            <p className="admin-login-error" role="alert">
              {error}
            </p>
          )}
          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? 'Verificando…' : 'Entrar al panel'}
            <MoveRight size={17} />
          </button>
        </form>
        <a className="admin-back-link" href="/">
          Volver al sitio público <ArrowUpRight size={14} />
        </a>
      </section>
    </main>
  )
}