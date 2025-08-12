import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CheckAuth from './components/CheckAuth'
import Tickets from './pages/Tickets'
import TicketDetails from './pages/TicketDetails'
import Signup from './pages/Signup'
import Admin from './pages/Admin'
import Login from './pages/login'
import Navbar from './components/Navbar'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={
            <CheckAuth protected={true}>
              <Tickets />
            </CheckAuth>} />
          <Route path='/tickets/:id' element={
            <CheckAuth protected={true}>
              <TicketDetails />
            </CheckAuth>} />
          <Route path='/login' element={
            <CheckAuth protected={false}>
              <Login />
            </CheckAuth>} />
          <Route path='/signup' element={
            <CheckAuth protected={false}>
              <Signup />
            </CheckAuth>} />
          <Route path='/admin' element={
            <CheckAuth protected={true}>
              <Admin />
            </CheckAuth>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
