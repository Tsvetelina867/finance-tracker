import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutModal from '../components/LogoutModal';
import { fetchBudgetDetails } from '../api/budgetApi';
import { fetchGoalsWithDetails } from '../api/goalsApi';
import { fetchTransactionsByDateRange } from '../api/transactionsApi';
import { fetchRecurringTransactions } from '../api/recurringTransactionsApi';
import { fetchAllAccounts, fetchAccountData } from '../api/accountApi';
import { fetchUserProfile } from '../api/userApi';
import { fetchAllCategories, addCategory, updateCategory, deleteCategory } from '../api/categoryApi';
import Navbar from '../components/Navbar';
import TransactionsSection from '../components/TransactionSection';
import RecurringTransactionsSection from '../components/RecurringTransactionsSection';
import BudgetProgress from '../components/BudgetProgress';
import GoalsProgress from '../components/GoalsProgress';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [budgetData, setBudgetData] = useState([]);
  const [goalsData, setGoalsData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);
  const [recurringTransactionsData, setRecurringTransactionsData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editedCategoryName, setEditedCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [visibleBudgets, setVisibleBudgets] = useState([]);
  const [isBudgetDataLoaded, setIsBudgetDataLoaded] = useState(false);
  const [isCategoriesPopupOpen, setCategoriesPopupOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    setLogoutModalOpen(false);
    navigate('/login');
  };

  const cancelLogout = () => {
    setLogoutModalOpen(false);
  };

   const fetchUserData = async () => {
    try {
      const userData = await fetchUserProfile();
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (!user) {
      fetchUserData();
    }
}, [user]);

   useEffect(() => {
     const fetchData = async () => {
       if (!currentUser || accounts.length > 0) {
         return;
       }

       try {
         const allAccountsRes = await fetchAllAccounts();

         const userAccounts = allAccountsRes.filter(account => account.user.id === currentUser.id);

         if (userAccounts.length === 0) {
           console.log('No accounts found for the current user');
           setCurrentAccount(null);
           localStorage.removeItem('selectedAccount');
         } else {
           setAccounts(userAccounts);

           const savedAccount = localStorage.getItem('selectedAccount');

           if (savedAccount) {
             const savedAccountData = JSON.parse(savedAccount);

             if (savedAccountData.user.id === currentUser.id) {
               setCurrentAccount(savedAccountData);
             } else {
               setCurrentAccount(userAccounts[0]);
               localStorage.setItem('selectedAccount', JSON.stringify(userAccounts[0]));
             }
           } else {
             setCurrentAccount(userAccounts[0]);
             localStorage.setItem('selectedAccount', JSON.stringify(userAccounts[0]));
           }
         }
       } catch (error) {
         console.error('Error fetching accounts:', error);
       } finally {
         setLoading(false);
       }
     };

     if (currentUser && accounts.length === 0) {
       fetchData();
     }
   }, [currentUser, accounts]);

   useEffect(() => {
     if (currentAccount) {
       const fetchData = async () => {
         try {
           const goalsRes = await fetchGoalsWithDetails(currentAccount.id);
           const budgetRes = await fetchBudgetDetails(currentAccount.id);
           const recurringRes = await fetchRecurringTransactions(currentAccount.id);

           setGoalsData(goalsRes);
           setBudgetData(budgetRes);
           setRecurringTransactionsData(recurringRes);
           await fetchCategories();
         } catch (error) {
           console.error('Error fetching data:', error);
         } finally {
           setLoading(false);
         }
       };

       fetchData();
     }
   }, [currentAccount]);


  const handleAccountChange = (selectedAccount) => {
    if (selectedAccount.user.id === currentUser.id) {
      localStorage.setItem('selectedAccount', JSON.stringify(selectedAccount));
      setCurrentAccount(selectedAccount);
    } else {
      console.warn('Attempted to select an account not belonging to the current user');
    }
  };


  const fetchTransactions = async () => {
    if (!currentAccount) return;
    try {
      const transactionsRes = await fetchTransactionsByDateRange(currentAccount.id, startDate, endDate);
      setTransactionsData(transactionsRes);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchCategories = async () => {
    if (!currentAccount) return;
    try {
      const categoriesRes = await fetchAllCategories();
      setCategories(categoriesRes);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!currentAccount || newCategoryName.trim() === '') return;
    try {
      const addedCategory = await addCategory({
        name: newCategoryName,
        accountId: currentAccount.id,
      });
      setCategories([...categories, addedCategory]);
      setNewCategoryName('');
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleEditCategory = (categoryId, currentName) => {
    setEditingCategoryId(categoryId);
    setEditedCategoryName(currentName);
    setIsEditing(true);
  };

  const handleSaveEditedCategory = async () => {
    if (editedCategoryName.trim()) {
      try {
        const updatedCategory = await updateCategory(editingCategoryId, {
                                                       id: editingCategoryId,
                                                       name: editedCategoryName,
                                                     });

        const updatedCategories = categories.map(category =>
          category.id === editingCategoryId ? updatedCategory : category
        );

        setCategories(updatedCategories);

        setEditingCategoryId(null);
        setIsEditing(false);
        setEditedCategoryName('');
      } catch (error) {
        console.error('Error updating category:', error);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingCategoryId(null);
    setEditedCategoryName('');
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      setCategories(categories.filter(category => category.id !== categoryId));
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const toggleCategoriesPopup = () => {
    setCategoriesPopupOpen(!isCategoriesPopupOpen);
  };


  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [currentAccount]);

  useEffect(() => {
    const showOnDashboard = JSON.parse(localStorage.getItem("showOnDashboard")) || {};
    const filteredBudgets = (budgetData || []).filter(budget => showOnDashboard[budget.id] === true);
    setVisibleBudgets(filteredBudgets);
  }, [budgetData]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGoalAdded = (newGoal) => {
    setGoalsData((prevGoals) => [...prevGoals, newGoal]);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <Navbar
        onLogout={handleLogout}
        accounts={accounts}
        currentAccount={currentAccount}
        onAccountChange={handleAccountChange}
      />
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={cancelLogout}
        onConfirm={confirmLogout}
      />

      <div className="dashboard-header">
         <h2>Account: {accounts.length > 0 ? `${accounts[0].name}`
  : (
                            <p>No accounts available. Please add an account from the Profile page.</p>
                          )}</h2>
         <h2>Balance: {currentAccount ? `${currentAccount.balance} ${currentAccount.currency}` : "No balance available"}</h2>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-left">
          <div className="widget-container">
            <div className="widget total-spending-widget">
              <h2 className="widget-title">Total Spending</h2>
              <p className="total-spending-amount">
                ${Array.isArray(transactionsData)
                  ? transactionsData.reduce((acc, transaction) => acc + transaction.amount, 0).toFixed(2)
                  : 0}
              </p>
            </div>

            <div className="widget transactions-widget">
              <h2 className="widget-title">Transaction History</h2>
              <TransactionsSection currentAccount={currentAccount} />
            </div>
          </div>

          <div className="widget-recurring">
            <h2>Recurring Spending</h2>
            <p>
              ${recurringTransactionsData.reduce((acc, transaction) => acc + transaction.amount, 0)}
            </p>
            <RecurringTransactionsSection currentAccount={currentAccount} />
          </div>
        </div>

        <div className="dashboard-right">
              <div
                        className={`floating-manage-btn ${isScrolled ? 'scroll-inactive' : ''}`}
                        onClick={toggleCategoriesPopup}
                      >
                        Manage Categories
                      </div>

              {isCategoriesPopupOpen && (
                      <>
                        <div className="modal-overlay" onClick={toggleCategoriesPopup}></div>
                        <div className="categories-popup">
                          <div className="categories-popup-content">
                            <button className="close-popup-btn" onClick={toggleCategoriesPopup}>X</button>

                            <div className="category-input-container">
                              <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Enter new category"
                              />
                              <button className="add-category-btn" onClick={handleAddCategory}>Add</button>
                            </div>

                            <h3>Existing Categories</h3>
                            <ul className="category-list">
                              {categories.map(category => (
                                <li key={category.id} className="category-item">
                                  {editingCategoryId === category.id ? (
                                    <>
                                      <input
                                        type="text"
                                        value={editedCategoryName}
                                        onChange={(e) => setEditedCategoryName(e.target.value)}
                                      />
                                      <button className="save-edit-btn " onClick={handleSaveEditedCategory}>Save</button>
                                      <button className="cancel-edit-btn" onClick={handleCancel}>Cancel</button>
                                    </>
                                  ) : (
                                    <>
                                      <span>{category.name}</span>
                                      <div>
                                        <button className="edit-button" onClick={() => handleEditCategory(category.id, category.name)}>Edit</button>
                                        <button className="delete-btn" onClick={() => handleDeleteCategory(category.id)}>Delete</button>
                                      </div>
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </>
                    )}

          <div className="widget">
            <h2>Budget Progress</h2>
            {visibleBudgets.length > 0 ? (
              <BudgetProgress budget={visibleBudgets} currentAccount={currentAccount} />
            ) : (
              <p>No budgets to display on dashboard.</p>
            )}
          </div>

          <div className="widget">
            <h2>Goal Progress</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <GoalsProgress
                goals={goalsData}
                currentAccount={currentAccount}
                onGoalAdded={handleGoalAdded}
                emptyStateMessage="No active goals yet. Start adding your goals!"
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
