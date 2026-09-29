import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { role, signOut } = useAuth()
  const navigate = useNavigate()
  const logout = async () => { await signOut(); navigate('/login') }

  if (role === 'parent') return <ParentShell />

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">AA Tuition<span>Student Progress Portal</span></div>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/students">Students</NavLink>
          <NavLink to="/timetable">Timetable</NavLink>
          <NavLink to="/lessons">Lessons</NavLink>
          <NavLink to="/reports">Reports</NavLink>
        </nav>
        <button className="linkButton" onClick={logout}>Sign out</button>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  )
}

function ParentShell() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const logout = async () => { await signOut(); navigate('/login') }
  return (
    <div className="parentShell">
      <header className="parentHeader">
        <div className="brand dark">AA Tuition<span>Parent Portal</span></div>
        <button className="ghost" onClick={logout}>Sign out</button>
      </header>
      <main className="parentMain"><Outlet /></main>
    </div>
  )
}
