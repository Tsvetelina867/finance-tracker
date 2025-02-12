import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import { fetchUserProfile } from '../api/userApi';
import { fetchAllAccounts, addAccount, updateAccount, deleteAccount } from '../api/accountApi';
import "../styles/Profile.css";

const AccountTypes = [
  'BANK_ACCOUNT',
  'CREDIT_CARD',
  'CASH',
  'INVESTMENT',
];

const Profile = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [profileData, setProfileData] = useState({ username: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({ name: '', balance: '', currency: '', type: 'BANK_ACCOUNT' });
  const [editingAccount, setEditingAccount] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetchUserProfile();
        setProfileData(res || { username: '', email: '' });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setLoading(false);
      }
    };

    const loadAccounts = async () => {
      try {
        const data = await fetchAllAccounts();
        setAccounts(data);
      } catch (error) {
        console.error('Error loading accounts:', error);
      }
    };

    fetchProfile();
    loadAccounts();
  }, []);


  const handleCreateAccount = async () => {
    if (!newAccount.name || !newAccount.balance || !newAccount.currency || !newAccount.type) return;

    try {
      await addAccount(newAccount);
      setNewAccount({ name: '', balance: '', currency: '', type: 'BANK_ACCOUNT' });
      const data = await fetchAllAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const handleUpdateAccount = async () => {
    if (!editingAccount.name || !editingAccount.balance || !editingAccount.currency || !editingAccount.type) return;

    try {
      await updateAccount(editingAccount.id, editingAccount);
      setEditingAccount(null);
      const data = await fetchAllAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;

    try {
      await deleteAccount(id);
      const data = await fetchAllAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard'); // Navigate to the dashboard
  };

  if (loading) {
    return <p>Loading your profile...</p>;
  }

  return (
    <div className="profile-container">
      <button onClick={handleGoBack} className="back-button">⬅️ Back to Dashboard</button> {/* Back to Dashboard button */}
      <h1>Profile</h1>
      <div className="profile-details">
        <p><strong>Username:</strong> {profileData.username || 'N/A'}</p>
        <p><strong>Email:</strong> {profileData.email || 'N/A'}</p>
      </div>

      <h2>Manage Your Accounts</h2>

      <div className="account-form">
        <input
          type="text"
          placeholder="Account Name"
          value={newAccount.name}
          onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Balance"
          value={newAccount.balance}
          onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
        />
        <input
          type="text"
          placeholder="Currency (e.g., USD, EUR)"
          value={newAccount.currency}
          onChange={(e) => setNewAccount({ ...newAccount, currency: e.target.value })}
        />
        <select
          value={newAccount.type}
          onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
        >
          {AccountTypes.map((type) => (
            <option key={type} value={type}>
              {type.replace('_', ' ').toLowerCase()}
            </option>
          ))}
        </select>
        <button onClick={handleCreateAccount}>Add Account</button>
      </div>

      <ul className="account-list">
        {accounts.map((account) => (
          <li key={account.id}>
            {editingAccount?.id === account.id ? (
              <>
                <input
                  type="text"
                  value={editingAccount.name}
                  onChange={(e) => setEditingAccount({ ...editingAccount, name: e.target.value })}
                />
                <input
                  type="number"
                  value={editingAccount.balance}
                  onChange={(e) => setEditingAccount({ ...editingAccount, balance: e.target.value })}
                />
                <input
                  type="text"
                  value={editingAccount.currency}
                  onChange={(e) => setEditingAccount({ ...editingAccount, currency: e.target.value })}
                />
                <select
                  value={editingAccount.type}
                  onChange={(e) => setEditingAccount({ ...editingAccount, type: e.target.value })}
                >
                  {AccountTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').toLowerCase()}
                    </option>
                  ))}
                </select>
                <button className="save-button" onClick={handleUpdateAccount}>Save</button>
                <button className="cancel-button" onClick={() => setEditingAccount(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span>{account.name} - {account.balance} {account.currency} ({account.type.replace('_', ' ').toLowerCase()})</span>
                <div>
                  <button className="edit-button" onClick={() => setEditingAccount(account)}>Edit</button>
                  <button className="delete-button" onClick={() => handleDeleteAccount(account.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Profile;
