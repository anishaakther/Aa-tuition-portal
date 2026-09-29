import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Timetable from './pages/Timetable'
import StudentDetail from './pages/StudentDetail'
import Lessons from './pages/Lessons'
import Reports from './pages/Reports'
import ParentPortal from './pages/ParentPortal'
import StudentAccess from './pages/StudentAccess'

function Protected({ children, parentOnly=false }){
  const { user, role, loading }=useAuth()
  if(loading) return <div className="loading">Loading portal…</div>
  if(!user) return <Navigate to="/login" replace />
  if(parentOnly && role!=='parent') return <Navigate to="/dashboard" replace />
  if(!parentOnly && role==='parent') return <Navigate to="/parent" replace />
  return children
}

export default function App(){return <Routes>
  <Route path="/login" element={<Login/>}/>
  <Route path="/access" element={<StudentAccess/>}/>
  <Route element={<Layout/>}>
    <Route path="/dashboard" element={<Protected><Dashboard/></Protected>}/>
    <Route path="/students" element={<Protected><Students/></Protected>}/>
    <Route path="/students/:id" element={<Protected><StudentDetail/></Protected>}/>
    <Route path="/timetable" element={<Protected><Timetable/></Protected>}/>
    <Route path="/lessons" element={<Protected><Lessons/></Protected>}/>
    <Route path="/reports" element={<Protected><Reports/></Protected>}/>
    <Route path="/parent" element={<Protected parentOnly><ParentPortal/></Protected>}/>
  </Route>
  <Route path="*" element={<Navigate to="/login" replace/>}/>
</Routes>}
