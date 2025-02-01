// src/components/Navbar.js

import "../styles/Navbar.css";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onLogout, accounts, currentAccount, onAccountChange }) => {
  const navigate = useNavigate();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/login');
  };

  const handleAccountChange = (accountId) => {
    onAccountChange(accountId);
    setShowAccountDropdown(false); // Close the dropdown after selection
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <h2>{currentAccount?.name}</h2>
        <p>{currentAccount?.balance} {currentAccount?.currency}</p>
        {/* Account Switch Dropdown */}
        <div className="account-dropdown">
          <button className="switch-account-btn" onClick={() => setShowAccountDropdown(!showAccountDropdown)}>
            Switch Account
          </button>
          {showAccountDropdown && (
            <ul className="dropdown-menu">
              {accounts.map(account => (
                <li key={account.id} onClick={() => handleAccountChange(account.id)}>
                  {account.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button className="profile-btn" onClick={() => navigate('/profile')}>Profile</button>
      </div>
      <div className="navbar-right">
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Navbar;
