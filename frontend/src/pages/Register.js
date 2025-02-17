import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Register.css';
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (password !== confirmPassword) {
      setMessage("Passwords don't match");
      setIsError(true);
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/auth/register', {
        username,
        email,
        password,
      });
      setMessage('Registration successful! Please log in.');
    } catch (err) {
      if (err.response) {
        setMessage(err.response.data);
      } else {
        setMessage('Registration failed. Please try again.');
      }
      setIsError(true);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Register</h2>
        {message && <p className={isError ? "error" : "success"}>{message}</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <button type="submit">Register</button>
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Register;