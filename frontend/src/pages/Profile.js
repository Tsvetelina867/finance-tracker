import React, { useState, useEffect } from 'react';
import { fetchUserProfile, updateUserProfile } from '../api/userApi';
import { fetchAllAccounts, addAccount, updateAccount, deleteAccount } from '../api/accountApi';
import "../styles/Profile.css";

const Profile = () => {
  const [profileData, setProfileData] = useState({ username: '', email: '' });
  const [updatedUsername, setUpdatedUsername] = useState('');
  const [updatedPassword, setUpdatedPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  const [accounts, setAccounts] = useState([]);
  const [newAccount, setNewAccount] = useState({ name: '', balance: '', currency: '' });
  const [editingAccount, setEditingAccount] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetchUserProfile();
        setProfileData(res);
        setUpdatedUsername(res.username); // Pre-fill username field
      } catch (error) {
        console.error('Error fetching profile data:', error);
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

  const handleUpdateProfile = async () => {
    try {
      const updateData = {
        username: updatedUsername,
        password: updatedPassword || null, // Only update password if provided
      };
      await updateUserProfile(updateData);
      setProfileData({ ...profileData, username: updatedUsername });
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile.');
    }
  };

  const handleCreateAccount = async () => {
    if (!newAccount.name || !newAccount.balance || !newAccount.currency) return;

    try {
      await addAccount(newAccount);
      setNewAccount({ name: '', balance: '', currency: '' });
      fetchAllAccounts();  // Refresh account list
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const handleUpdateAccount = async () => {
    if (!editingAccount.name || !editingAccount.balance || !editingAccount.currency) return;

    try {
      await updateAccount(editingAccount.id, editingAccount);
      setEditingAccount(null);
      fetchAllAccounts();  // Refresh account list
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;

    try {
      await deleteAccount(id);
      fetchAllAccounts();  // Refresh account list
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      {message && <p className="message">{message}</p>}

      {isEditing ? (
        <div className="edit-form">
          <label>Username:</label>
          <input
            type="text"
            value={updatedUsername}
            onChange={(e) => setUpdatedUsername(e.target.value)}
          />

          <label>New Password:</label>
          <input
            type="password"
            value={updatedPassword}
            onChange={(e) => setUpdatedPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
          />

          <button onClick={handleUpdateProfile}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div className="profile-details">
          <p><strong>Username:</strong> {profileData.username}</p>
          <p><strong>Email:</strong> {profileData.email}</p>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      )}

      <h2>Manage Your Accounts</h2>

      {/* Add Account Form */}
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
        <button onClick={handleCreateAccount}>Add Account</button>
      </div>

      {/* Account List */}
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
                <button onClick={handleUpdateAccount}>Save</button>
                <button onClick={() => setEditingAccount(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span>{account.name} - {account.balance} {account.currency}</span>
                <button onClick={() => setEditingAccount(account)}>Edit</button>
                <button onClick={() => handleDeleteAccount(account.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Profile;
