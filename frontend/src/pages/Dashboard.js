import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutModal from '../components/LogoutModal';
import { fetchBudgetDetails } from '../api/budgetApi';
import { fetchGoalsWithDetails } from '../api/goalsApi';
import { fetchTransactionsByDateRange } from '../api/transactionsApi';
import { fetchRecurringTransactions } from '../api/recurringTransactionsApi';
import { fetchAllAccounts, fetchAccountData } from '../api/accountApi';
import Navbar from '../components/Navbar';
import TransactionsSection from '../components/TransactionSection';
import RecurringTransactionsSection from '../components/RecurringTransactionsSection';
import BudgetProgress from '../components/BudgetProgress';
import GoalsProgress from '../components/GoalsProgress';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [budgetData, setBudgetData] = useState([]);
  const [goalsData, setGoalsData] = useState([]);
  const [transactionsData, setTransactionsData] = useState([]);
  const [recurringTransactionsData, setRecurringTransactionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [visibleBudgets, setVisibleBudgets] = useState([]);
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

  const handleAccountChange = (selectedAccount) => {
    localStorage.setItem('selectedAccount', JSON.stringify(selectedAccount)); // ✅ Save to localStorage
    setCurrentAccount(selectedAccount);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allAccountsRes = await fetchAllAccounts();
        setAccounts(allAccountsRes); // Update accounts state

        const savedAccount = localStorage.getItem('selectedAccount');
        if (savedAccount) {
          setCurrentAccount(JSON.parse(savedAccount)); // ✅ Load from localStorage
        } else {
          const allAccountsRes = await fetchAllAccounts();
          setAccounts(allAccountsRes);

          const currentAccountRes = await fetchAccountData();
          if (currentAccountRes) {
            setCurrentAccount(currentAccountRes);
          } else if (allAccountsRes.length > 0) {
            setCurrentAccount(allAccountsRes[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    if (!currentAccount) return;
    const fetchData = async () => {
      try {
        const goalsRes = await fetchGoalsWithDetails(currentAccount.id);
        const storedGoals = JSON.parse(localStorage.getItem('goals')) || [];

              // Merge backend goals with local storage goals to update the state
              const updatedGoals = goalsRes.map(goal => {
                const storedGoal = storedGoals.find(stored => stored.id === goal.id);
                if (storedGoal) {
                  return { ...goal, isAchieved: storedGoal.isAchieved };
                }
                return goal;
              });
              setGoalsData(updatedGoals);
        const budgetRes = await fetchBudgetDetails(currentAccount.id);
        const recurringRes = await fetchRecurringTransactions(currentAccount.id);

        setGoalsData(goalsRes);
        setBudgetData(budgetRes);
        setRecurringTransactionsData(recurringRes);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentAccount]);

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [currentAccount]);

  useEffect(() => {
    const showOnDashboard = JSON.parse(localStorage.getItem("showOnDashboard")) || {};
    // Filter the budgets to only show the ones that have showOnDashboard set to true
    const filteredBudgets = (budgetData || []).filter(budget => showOnDashboard[budget.id] === true);


    setVisibleBudgets(filteredBudgets);
  }, [budgetData]);


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
        <h2>Account: {currentAccount?.name}</h2>
        <h2>Balance: {currentAccount?.balance} {currentAccount?.currency}</h2>
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
            {loading ? <p>Loading...</p> : goalsData.length === 0 ? (
              <p>No active goals</p>
            ) : (
              <GoalsProgress goals={goalsData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
