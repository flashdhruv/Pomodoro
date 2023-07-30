import React from 'react';
import { useState } from 'react';
import { useNavigate, Link, createSearchParams } from 'react-router-dom';

const Login = () => {

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [Data, setData] = useState('');
    const [isValid, setIsValid] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(event) {
    event.preventDefault();
    console.log(`name: ${name} Password: ${password}`);
    // perform login logic here

  await fetch('http://localhost:3001/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      password,
    }),
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      localStorage.setItem('userData', JSON.stringify(data.JWTtoken));
      console.log(data.JWTtoken);
      alert("Login Successful");
      navigate({
        pathname: '/pomodoro',
        search: createSearchParams({
          username: data.name
        }).toString()
      });
      //send them to place
    })
    .catch(error => alert("Login Failed")); //send if failed


  // reset the form fields
  setName('');
  setPassword('');
  };

  const goToSignUp = () => {
    navigate('/signup');
  }
  const goToPomodoro = () => {
    navigate({
      pathname: '/pomodoro',
      search: createSearchParams({
        name: "guest"
      }).toString()
    });
  }

    return ( 
      <React.Fragment>
        <div className='container-fluid px-0 '>
        <div className="row g-0">
        <div className="col-lg-6 d-flex align-items-center"> 
        <div className='w-100'>
        <h1 className='text-center'>Login</h1>
    <form onSubmit={handleSubmit} className='text-center'>
    <div className="form-outline mb-4">
      <label>
        username:
        <input
          type="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setIsValid(event.target.validity.valid);
          }}
          required
        />
      </label>
      </div>
      <div className="form-outline mb-4">   
      <label>
        Password:
        <input
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setIsValid(event.target.validity.valid);
          }}
          required
          minLength="6"
        />
      </label>
      </div>
      <button type="submit" className="btn btn-primary btn-block">Login</button>
    </form>

        <div className='text-center'>
          <p className='my-2'>Not a member? <a onClick={goToSignUp}>Sign Up</a></p>
          {/* add styling for sign up */}
        </div>
        </div>
        </div>
        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-info bg-gradient vh-100">
          <p>Don't want to set up an account?</p>
          <button onClick={goToPomodoro}>Continue as guest</button>
        </div>
    </div>
    </div>
    </React.Fragment>
  );

}
 
export default Login;