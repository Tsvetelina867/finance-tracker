import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Login.css';
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = 'http://localhost:8080/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: token },
        withCredentials: true,
      })
      .then((response) => {
        navigate('/dashboard', { replace: true });
      })
      .catch((error) => {
        console.error("Invalid token, forcing re-login:", error);
        localStorage.removeItem('token');
      });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      }, { withCredentials: true });

      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        setMessage('Login successful! Redirecting...');
        navigate('/dashboard', { replace: true });
      } else {
        setMessage('No token received. Please try again.');
        setIsError(true);
        localStorage.removeItem('token');
      }
    } catch (err) {
      setMessage('Invalid username or password. Please try again.');
      setIsError(true);
      localStorage.removeItem('token');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        {message && <p className={isError ? "error" : "success"}>{message}</p>}
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
