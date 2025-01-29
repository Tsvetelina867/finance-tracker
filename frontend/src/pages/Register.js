import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Register.css';
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      toast.error("Passwords don't match", { position: "top-center" });
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/register', {
        username,
        email,
        password,
      });
      console.log('User registered:', response.data);
      toast.success('Registration successful! Please log in.', { position: "top-center" });
      } catch (err) {
      if (err.response && err.response.data === "User with that username already exists.") {
              toast.error("Username already exists. Please choose another.", { position: "top-center" });
      } else if(err.response && err.response.data === "User with that email already exists.") {
                                toast.error("Email already exists. Please log in.", { position: "top-center" });
      } else {
          toast.error('Registration failed. Please try again.', { position: "top-center" });
      }
    }
  };

  return (
    <div className="register-container">
    <div className="register-box">
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
        <p>Already have an account? <Link to="/login">Login here</Link></p>
      </form>
      </div>
    </div>
  );
};

export default Register;
