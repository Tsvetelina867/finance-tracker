import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LogoutModal from "../components/LogoutModal";
import TransactionsSection from "../components/TransactionSection";
import RecurringTransactionsSection from "../components/RecurringTransactionsSection";
import BudgetProgress from "../components/BudgetProgress";
import GoalsProgress from "../components/GoalsProgress";
import SpendingChart from "../components/SpendingChart";
import useUser from "../hooks/useUser";
import useAccounts from "../hooks/useAccounts";
import useTransactions from "../hooks/useTransactions";
import useCategories from "../hooks/useCategories";
import useGoals from "../hooks/useGoals";
import "../styles/Dashboard.css";

function getPastDate(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

const Dashboard = () => {
  const navigate = useNavigate();

  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isCategoriesPopupOpen, setCategoriesPopupOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const [startDate, setStartDate] = useState(getPastDate(30));
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [appliedStart, setAppliedStart] = useState(getPastDate(30));
  const [appliedEnd, setAppliedEnd] = useState(
    new Date().toISOString().split("T")[0],
  );

  const { currentUser, loadingUser } = useUser();
  const { accounts, currentAccount, setCurrentAccount, loadingAccounts } =
    useAccounts(currentUser);
  const { transactions } = useTransactions(
    currentAccount,
    appliedStart,
    appliedEnd,
  );
  const { categories, createCategory, editCategory, removeCategory } =
    useCategories(currentUser);
  const { goals, addGoal, loadingGoals } = useGoals(currentAccount);

  const handleApply = () => {
    setAppliedStart(startDate);
    setAppliedEnd(endDate);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const totalSpending = useMemo(() => {
    return (transactions || [])
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0)
      .toFixed(2);
  }, [transactions]);

  const handleStartEdit = (category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleSaveEdit = () => {
    if (editingCategoryName.trim()) {
      editCategory(editingCategoryId, editingCategoryName.trim());
    }
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  if (loadingUser || loadingAccounts) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      <Navbar
        onLogout={() => setLogoutModalOpen(true)}
        accounts={accounts}
        currentAccount={currentAccount}
        onAccountChange={(acc) => setCurrentAccount(acc)}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />

      <div className="dashboard-header">
        {currentAccount ? (
          <>
            <h2>Account: {currentAccount.name}</h2>
            <h2>
              Balance: {currentAccount.balance} {currentAccount.currency}
            </h2>
          </>
        ) : (
          <p>No account selected</p>
        )}
      </div>

      <div className="dashboard-main">
        <div className="dashboard-left">
          <div className="widget">
            <h2>Total Spending</h2>
            <p>
              {totalSpending} {currentAccount?.currency}
            </p>
          </div>

          <div className="widget">
            <h2>Transactions</h2>
            <TransactionsSection
              currentAccount={currentAccount}
              transactions={transactions}
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              onApply={handleApply}
            />
          </div>

          <div className="widget">
            <RecurringTransactionsSection currentAccount={currentAccount} />
          </div>
        </div>

        <div className="dashboard-right">
          <button
            className="floating-manage-btn"
            onClick={() => setCategoriesPopupOpen(true)}
          >
            Manage Categories
          </button>

          {isCategoriesPopupOpen && (
            <div className="categories-popup">
              <div className="categories-popup-content">
                <button
                  className="close-popup-btn"
                  onClick={() => setCategoriesPopupOpen(false)}
                >
                  X
                </button>

                <div className="category-input-container">
                  <input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category"
                  />
                  <button
                    className="add-category-btn"
                    onClick={() => {
                      if (newCategoryName.trim()) {
                        createCategory(newCategoryName.trim());
                        setNewCategoryName("");
                      }
                    }}
                  >
                    Add
                  </button>
                </div>

                <ul className="category-list">
                  {categories.map((c) => (
                    <li key={c.id} className="category-item">
                      {editingCategoryId === c.id ? (
                        <>
                          <input
                            value={editingCategoryName}
                            onChange={(e) =>
                              setEditingCategoryName(e.target.value)
                            }
                          />
                          <button
                            className="save-edit-btn"
                            onClick={handleSaveEdit}
                          >
                            Save
                          </button>
                          <button
                            className="cancel-edit-btn"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span>{c.name}</span>
                          <div>
                            <button
                              className="edit-button"
                              onClick={() => handleStartEdit(c)}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => removeCategory(c.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="widget">
            <h2>Budget Progress</h2>
            <BudgetProgress
              currentAccount={currentAccount}
              transactions={transactions}
            />
          </div>

          <div className="widget">
            <h2>Goals</h2>
            <GoalsProgress
              goals={goals}
              loading={loadingGoals}
              onAddGoal={addGoal}
              currentAccount={currentAccount}
            />
          </div>

          <div className="widget">
            <h2>Spending Chart</h2>
            <SpendingChart data={transactions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
