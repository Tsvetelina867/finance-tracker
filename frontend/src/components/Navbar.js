// src/components/Navbar.js
import "../styles/Navbar.css";
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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

        {/* Profile and Manage Transactions buttons next to each other */}
        <button className="profile-btn" onClick={() => navigate('/profile')}>Profile</button>
        <Link
          to="/transactions-management"
          state={{ currentAccount }}
        >
          <button className="manage-transactions-button">Manage Transactions</button>
        </Link>

      </div>

      <div className="navbar-right">
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Navbar;
