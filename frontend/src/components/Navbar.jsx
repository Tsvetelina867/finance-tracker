import "../styles/Navbar.css";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({
  onLogout,
  accounts = [],
  currentAccount,
  onAccountChange,
}) => {
  const navigate = useNavigate();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const dropdownRef = useRef();

  const handleLogout = () => {
    onLogout();
  };

  const handleAccountChange = (accountId) => {
    const selectedAccount = accounts.find((acc) => acc.id === accountId);
    if (!selectedAccount) {
      console.error("Account not found:", accountId);
      return;
    }
    onAccountChange(selectedAccount);
    setShowAccountDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowAccountDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="account-dropdown" ref={dropdownRef}>
          <button
            className="switch-account-btn"
            onClick={() => setShowAccountDropdown((prev) => !prev)}
          >
            {currentAccount ? currentAccount.name : "Select Account"}
          </button>

          {showAccountDropdown && (
            <ul className="dropdown-menu">
              {Array.isArray(accounts) && accounts.length > 0 ? (
                accounts
                  .filter((acc) => acc.id !== currentAccount?.id)
                  .map((account) => (
                    <li
                      key={account.id}
                      onClick={() => handleAccountChange(account.id)}
                      className="dropdown-item"
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

        <button className="profile-btn" onClick={() => navigate("/profile")}>
          Profile
        </button>

        <button
          className="manage-transactions-button"
          onClick={() =>
            navigate("/transactions-management", { state: { currentAccount } })
          }
        >
          Manage Transactions
        </button>

        <button
          onClick={() =>
            navigate("/modify-budgets", { state: { currentAccount } })
          }
        >
          Modify Budgets
        </button>
      </div>

      <div className="navbar-right">
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Navbar;
