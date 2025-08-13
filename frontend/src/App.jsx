import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import CheckAuth from './components/CheckAuth'
import Tickets from './pages/Tickets'
import TicketDetails from './pages/TicketDetails'
import Signup from './pages/Signup'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Navbar from './components/Navbar'

function AppLayout() {
  const location = useLocation()
  const hideNavbarPaths = ['/login', '/signup']

  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname)

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            <CheckAuth protectedRoute={true}>
              <Tickets />
            </CheckAuth>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <CheckAuth protectedRoute={true}>
              <TicketDetails />
            </CheckAuth>
          }
        />
        <Route
          path="/login"
          element={
            <CheckAuth protectedRoute={false}>
              <Login />
            </CheckAuth>
          }
        />
        <Route
          path="/signup"
          element={
            <CheckAuth protectedRoute={false}>
              <Signup />
            </CheckAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <CheckAuth protectedRoute={true}>
              <Admin />
            </CheckAuth>
          }
        />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App
