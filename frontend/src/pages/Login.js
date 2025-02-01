import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Login.css';
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();  // Add the useNavigate hook

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username,
        password,
      });

      localStorage.setItem('token', response.data.token);
      toast.success('Login successful! Redirecting...', { position: "top-center" });

      console.log('User logged in:', response.data);

      // Redirect to the dashboard after a successful login
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Invalid username or password. Please try again.', { position: "top-center" });
    }
  };

  return (
    <div className="login-container">
        <div className="login-box">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <p>Don't have an account? <Link to="/register">Register here</Link></p>
      </form>
      </div>
    </div>
  );
};

export default Login;
