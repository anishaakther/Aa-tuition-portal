import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('tutor')
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setError('')
    const { error } = await signIn(email || 'demo@aatuition.com', password || 'demo', role)
    if (error) setError(error.message)
    else navigate(role === 'parent' ? '/parent' : '/dashboard')
  }

  return (
    <div className="loginPage">
      <div className="loginPanel">
        <div className="eyebrow">AA TUITION</div>
        <h1>Progress that parents can actually see.</h1>
        <p>Track lessons, attendance, topics, assessments and student progress in one secure portal.</p>
        <div className="loginFeature"><b>Live progress</b><span>Compare actual course progress with where the student should be by now.</span></div>
        <div className="loginFeature"><b>Parent access</b><span>Parents only see the student linked to their account.</span></div>
        <div className="loginFeature"><b>One source of truth</b><span>Lesson notes, grades, attendance and next steps stay together.</span></div>
      </div>
      <form className="loginCard" onSubmit={submit}>
        <h2>Sign in</h2>
        <p className="muted">Access the AA Tuition portal.</p>
        {!isSupabaseConfigured && <div className="demoNotice">Demo mode is active. Choose Tutor or Parent and press Sign in.</div>}
        {!isSupabaseConfigured && (
          <label>Demo access
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="tutor">Tutor dashboard</option>
              <option value="parent">Parent portal</option>
            </select>
          </label>
        )}
        <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" /></label>
        {error && <div className="error">{error}</div>}
        <button className="primary wide">Sign in</button>
        <div className="loginDivider"><span>or</span></div>
        <button type="button" className="ghost wide" onClick={()=>navigate('/access')}>Student / parent access code</button>
      </form>
    </div>
  )
}
