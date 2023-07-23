import React from 'react';
import { useState } from 'react';
import { useNavigate, Link, createSearchParams } from 'react-router-dom';

const SignUp = () => {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [listOfErrors, SetListOfErrors] = useState([]);
    const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(`Email: ${email} Password: ${password} Name: ${name}`);
  //   const formData = new URLSearchParams();
  // formData.append('name', name);
  // formData.append('email', email);
  // formData.append('password', password);

  // perform signup logic here
  fetch('http://localhost:3001/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  })
  .then(response => response.json())
  .then(data => {
    if (data && data.errorArray) {
      // Store the error array in a variable or state for displaying to the client
      SetListOfErrors(data.errorArray);
      // Handle the errors and display them to the user
    }else{
      SetListOfErrors([]);
      alert("SignUp Successful");
      console.log(data);
      navigate('/');
    }
  })
  .catch(error => console.error(error));
  

  // reset the form fields
  setName('');
  setEmail('');
  setPassword('');
  };

    return ( 
      <React.Fragment>
       {/* Display errors in your component */}
       {listOfErrors.length > 0 &&
        <ul>
          {listOfErrors.map((error, index) => (
            <li key={index}>{error.msg}</li>
          ))}
        </ul>
      }
       <div className="d-flex align-items-center justify-content-center vh-100">
      <div>
      <h1 className='text-center'>Sign Up</h1>
    <form onSubmit={handleSubmit} className='text-center my-4'>
      <div className="form-outline mb-4">
        <label>
        Username
        <input
          type="text"
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
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setIsValid(event.target.validity.valid);
          }}
          required
        />
      </label>
      </div>

      <div className="form-outline mb-4">
      <label>
        Password
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
      <button type="submit" className="btn btn-primary btn-block mb-4">Sign Up</button>
    </form>
    </div>
    </div>
    </React.Fragment>
     );
}
 
export default SignUp;