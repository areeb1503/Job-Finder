import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Page from './Components/LandingPage/Page';
import Home from './Components/LandingPage/Home';
import About from './Components/LandingPage/About';
import Login from './Components/Auth/Login';
import SignUp from './Components/Auth/SignUp';

function App() {
  return (
    <Router>
      <Routes>
        {/*If user is not logged in we make available the landing page below, else we make available the Login page 
        (TODO : use conditional rendering to handle this case)*/}
        <Route path='/' element={<Page />}> {/*Page with outlet for nested routes below*/}
          <Route path='' element={<Home/>}/>
          <Route path='about' element={<About/>}/>
        </Route>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<SignUp/>}/>
      </Routes>
    </Router>
  );
}

export default App