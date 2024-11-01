import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Page from './Components/LandingPage/Page';
import Home from './Components/LandingPage/Home';
import About from './Components/LandingPage/About';
import Login from './Components/Auth/Login';
import SignUp from './Components/Auth/SignUp';
import ScrollToTop from './Components/Utils/ScrollToTop';
import AppPage from './Components/App/AppPage';
import Jobs from './Components/App/Jobs';
import Resume from './Components/App/Resume';
import Feedback from './Components/App/Feedback';
import Settings from './Components/App/Settings';
import Welcome from './Components/App/Welcome';
import Recommend from './Components/App/JobPages/Recommend';
import Liked from './Components/App/JobPages/Liked';
import RecPage from './Components/App/RecruiterPages/RecPage';
import RecWelcome from './Components/App/RecruiterPages/RecWelcome';
import UploadJobs from './Components/App/RecruiterPages/UploadJobs';
import YourJobs from './Components/App/RecruiterPages/YourJobs';
import RequireAuth from './Components/Auth/RequireAuth';
import Unauthorized from './Components/Utils/Unauthorized';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path='/' element={<Page />}> {/*Page with outlet for nested routes below*/}
          <Route path='' element={<Home />} />
          <Route path='about' element={<About />} />
        </Route>

        <Route path='/login' element={<Login />} />

        <Route path='/signup' element={<SignUp />} />

        <Route element={<RequireAuth allowedRole={'student'} />}>
          <Route path='/app/' element={<AppPage />}>{/*Page with outlet for nested routes below*/}
            <Route path='' element={<Welcome />} />
            <Route path='jobs/' element={<Jobs />}>{/*Page with outlet for nested routes below*/}
              <Route path='' element={<Recommend />} />
              <Route path='liked' element={<Liked />} />
            </Route>
            <Route path='resume' element={<Resume />} />
            <Route path='feedback' element={<Feedback />} />
            <Route path='settings' element={<Settings />} />
          </Route>
        </Route>

        <Route element={<RequireAuth allowedRole={'recruiter'} />}>
          <Route path='/recruiter/' element={<RecPage />}>{/*Page with outlet for nested routes below*/}
            <Route path='' element={<RecWelcome />} />
            <Route path='uploadjobs' element={<UploadJobs />} />
            <Route path='yourjobs' element={<YourJobs />} />
            <Route path='feedback' element={<Feedback />} />
            <Route path='settings' element={<Settings />} />
          </Route>
        </Route>


        {/*Catch for unautherized access*/}
        <Route path='/unauthorized' element={<Unauthorized />} />
      </Routes>
    </>
  );
}

export default App

/*
localStorage.setItem("User", JSON.stringify(token))
if !user ? LandingPage : App
*/

