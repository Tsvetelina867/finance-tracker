import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutModal from '../components/LogoutModal';
import { fetchBudgetData } from '../api/budgetApi';
import { fetchGoalsData } from '../api/goalsApi';
import { fetchTransactionsData } from '../api/transactionsApi';
import { fetchRecurringTransactions } from '../api/recurringTransactionsApi';
import { fetchAccountData, fetchAllAccounts } from '../api/accountApi';
import Navbar from '../components/Navbar';
import TransactionsSection, {fetchTransactions} from '../components/TransactionSection';
import RecurringTransactionsSection from '../components/RecurringTransactionsSection';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [goalsData, setGoalsData] = useState(null);
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
    try {
      const transactionsRes = await fetchTransactions(currentAccount?.id, startDate, endDate);
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
        setCurrentAccount(allAccountsRes[0]);
        const budgetRes = await fetchBudgetData();
        const goalsRes = await fetchGoalsData();
        const recurringRes = await fetchRecurringTransactions();

        setBudgetData(budgetRes);
        setGoalsData(goalsRes);
        setRecurringTransactionsData(recurringRes);
        fetchTransactions();
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [currentAccount, startDate, endDate]);

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
          <div className="widget">
            <h2>Total Spending</h2>
            <p>${transactionsData.reduce((acc, transaction) => acc + transaction.amount, 0)}</p>
             <TransactionsSection currentAccount={currentAccount} />
          </div>



          <div className="widget">
            <h2>Recurring Spending</h2>
            <p>${recurringTransactionsData.reduce((acc, transaction) => acc + transaction.amount, 0)}</p>
            <RecurringTransactionsSection currentAccount={currentAccount} />
          </div>
        </div>

        <div className="dashboard-right">
          <div className="widget">
            <h2>Budget Progress</h2>
            <p>{budgetData?.progress || 0}%</p>
          </div>

          <div className="widget">
            <h2>Goals Progress</h2>
            <p>{goalsData?.activeGoals ? goalsData.activeGoals.length : 0} Active Goals</p>
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
