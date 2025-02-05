import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LogoutModal from '../components/LogoutModal';
import { fetchBudgetDetails } from '../api/budgetApi';
import { fetchGoalsWithDetails } from '../api/goalsApi';
import { fetchTransactionsByDateRange } from '../api/transactionsApi';
import { fetchRecurringTransactions } from '../api/recurringTransactionsApi';
import { fetchAllAccounts } from '../api/accountApi';
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
        setAccounts(allAccountsRes);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // New useEffect to set the first account when accounts are loaded
  useEffect(() => {
    if (accounts.length > 0) {
      setCurrentAccount(accounts[0]);
    }
  }, [accounts]);

  useEffect(() => {
    if (!currentAccount) return;
    const fetchData = async () => {
      try {
        const goalsRes = await fetchGoalsWithDetails(currentAccount.id);
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


  // New useEffect to fetch transactions when currentAccount is set
  useEffect(() => {
    if (currentAccount) {
      fetchTransactions();
    }
  }, [currentAccount]);

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate]);

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
        <h2>{currentAccount?.name}</h2>
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
            {budgetData ? (
              <div>
                <h3>{budgetData.description}</h3>
                <p>{budgetData.progress || 0}%</p>
                <BudgetProgress budget={budgetData} />
              </div>
            ) : (
              <p>No budgets available</p>
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

      <div className="dashboard-transactions">
        <h2>Recent Transactions</h2>
        <div className="date-filters">
          <label>Start Date: <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
          <label>End Date: <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
          <button onClick={fetchTransactions}>Filter</button>
        </div>
        <ul>
          {transactionsData.map(transaction => (
            <li key={transaction.id}>{transaction.description} - {transaction.amount} {currentAccount?.currency}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
