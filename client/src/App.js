import React from 'react';
import {  Routes, Route, BrowserRouter } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Pomodoro from './components/Pomodoro';
import Profile from './components/Profile';
import Store from './components/Store';

const App = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login/>} />
                <Route path="signup" exact element={<SignUp/>} />
                <Route path="pomodoro" exact element={<Pomodoro/>} />
                <Route path='profile' exact element ={<Profile/>} />
                <Route path='store' exact element ={<Store/>} />
        </Routes>
    </BrowserRouter>
  );
};

export default App;