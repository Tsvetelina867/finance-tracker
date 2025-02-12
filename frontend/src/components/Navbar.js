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
    const selectedAccount = accounts.find(acc => acc.id === accountId);
    if (!selectedAccount) {
      console.error("Account not found for ID:", accountId);
      return;
    }
    onAccountChange(selectedAccount); // ✅ Passing the full object
    setShowAccountDropdown(false);
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        {/* Account Switch Dropdown */}
        <div className="account-dropdown">
          <button
            className="switch-account-btn"
            onClick={() => {
              setShowAccountDropdown(prev => !prev);
            }}
          >
            Switch Account
          </button>


          {showAccountDropdown && (
            <ul className="dropdown-menu">
              {accounts.length > 0 ? (
                accounts
                  .filter(account => account.id !== currentAccount?.id)
                  .map(account => (
                    <li
                      key={account.id}
                      onClick={() => handleAccountChange(account.id)}
                      style={{ cursor: 'pointer', padding: '5px 10px', borderBottom: '1px solid #ddd' }}
                    >
                      {account.name}
                    </li>
                  ))
              ) : (
                <li>No accounts available</li>
              )}
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
        <Link
          to="/modify-budgets"
          state={{ currentAccount }} // Pass currentAccount as state here
        >
          <button>Modify Budgets</button>
        </Link>

      </div>

      <div className="navbar-right">
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Navbar;
