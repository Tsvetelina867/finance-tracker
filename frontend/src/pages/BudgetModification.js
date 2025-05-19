import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchAllBudgets, updateBudget, deleteBudget, addBudget } from '../api/budgetApi';
import { fetchAllCategories } from '../api/categoryApi';
import '../styles/BudgetModification.css';

const BudgetModification = () => {
  const location = useLocation();
  const currentAccount = location.state?.currentAccount;

  const [budgets, setBudgets] = useState([]);
  const [showOnDashboard, setShowOnDashboard] = useState({});
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    startDate: '',
    endDate: '',
    category: '',
    budgetLimit: '',
    currentSpending: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentAccount) {
      console.error("No current account selected.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const budgetsRes = await fetchAllBudgets(currentAccount.id);
        setBudgets(budgetsRes);

        const categoriesRes = await fetchAllCategories();
        setCategories(categoriesRes);

        const storedPreferences = localStorage.getItem('showOnDashboard');
        if (storedPreferences) {
          setShowOnDashboard(JSON.parse(storedPreferences));
        }
      } catch (error) {
        console.error('Error fetching budgets or categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentAccount]);

  const handleEdit = (budget) => {
    setIsEditing(true);
    setFormData({
      id: budget.id,
      startDate: budget.startDate ? new Date(budget.startDate).toISOString().split('T')[0] : '',
      endDate: budget.endDate ? new Date(budget.endDate).toISOString().split('T')[0] : '',
      category: budget.category ? budget.category.id : '',
      budgetLimit: budget.budgetLimit || '',
      currentSpending: budget.currentSpending || 0,
      description: budget.description || '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const budgetData = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        category: { id: formData.category },
        budgetLimit: formData.budgetLimit,
        currentSpending: formData.currentSpending,
        description: formData.description,
        account: { id: currentAccount.id },
      };

      if (formData.id) {
        const updatedBudget = await updateBudget(formData.id, budgetData);
        setBudgets(budgets.map(b => b.id === formData.id ? updatedBudget : b));
      } else {
        const addedBudget = await addBudget(budgetData);
        if (addedBudget) {
          setBudgets([...budgets, addedBudget]);
        }
      }

      setIsEditing(false);
      setFormData({
        id: null,
        startDate: '',
        endDate: '',
        category: '',
        budgetLimit: '',
        currentSpending: '',
        description: '',
      });
    } catch (error) {
      console.error('Error adding or updating budget:', error);
    }
  };


  const handleDelete = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(budgetId);
        setBudgets(budgets.filter(budget => budget.id !== budgetId));
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  const handleAdd = () => {
    setIsEditing(true);
    setFormData({
      id: null,
      startDate: '',
      endDate: '',
      category: '',
      budgetLimit: '',
      currentSpending: '',
      description: '',
    });
  };

  const handleToggleShowOnDashboard = (budgetId) => {
    setShowOnDashboard((prevState) => {
      const updatedState = { ...prevState, [budgetId]: !prevState[budgetId] };
      localStorage.setItem("showOnDashboard", JSON.stringify(updatedState));
      return updatedState;
    });
  };

  const calculateProgress = (budgetLimit, currentSpending) => {
    return Math.min((currentSpending / budgetLimit) * 100, 100);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const handleGoBack = () => {
      navigate('/dashboard');
    };

    if (!currentAccount) {
        return (
          <div>
            <button
              onClick={handleGoBack}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                marginBottom: '20px',
              }}
              className="back-button"
            >
              ⬅️ Back to Dashboard
            </button>
            <h1>Manage Budgets</h1>
            <p>No account selected. Please select an account to manage budgets.</p>
          </div>
        );
      }

  return (
    <div className="modify-budget-container">
    <button onClick={handleGoBack} className="back-button">⬅️ Back to Dashboard</button>
      <h2>Manage Budgets</h2>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {isEditing && (
            <form onSubmit={handleSubmit} className="budget-form">
              <h3>{formData.id ? 'Edit Budget' : 'Add New Budget'}</h3>

              <div className="form-group">
                <label htmlFor="startDate">Start Date:</label>
                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date:</label>
                <input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category:</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="" disabled hidden>
                      Select a category
                    </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="budgetLimit">Budget Limit:</label>
                <input
                  id="budgetLimit"
                  type="number"
                  name="budgetLimit"
                  value={formData.budgetLimit}
                  onChange={(e) => setFormData({ ...formData, budgetLimit: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="currentSpending">Current Spending:</label>
                <input
                  id="currentSpending"
                  type="number"
                  name="currentSpending"
                  value={formData.currentSpending}
                  onChange={(e) => setFormData({ ...formData, currentSpending: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  placeholder="Enter a brief description of the budget"
                />
              </div>

              <button type="submit" className="submit-btn">
                {formData.id ? 'Update Budget' : 'Add Budget'}
              </button>
              <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </form>

          )}

          {!isEditing && (
            <button className="add-btn" onClick={handleAdd}>
              Add New Budget
            </button>
          )}

          <h3>Existing Budgets</h3>
          <ul className="budget-list">
            {budgets.map((budget) => (
              <li key={budget.id} className="budget-item">
                <div className="budget-details">
                  <div>
                    <strong>{formatDate(budget.startDate)} - {formatDate(budget.endDate)}</strong>
                  </div>
                  <div>
                    <em>{budget.category?.name}</em> | Budget Limit: ${budget.budgetLimit} | Current Spending: ${budget.currentSpending}
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress"
                      style={{ width: `${calculateProgress(budget.budgetLimit, budget.currentSpending)}%` }}
                    ></div>
                  </div>
                  <div className="budget-description">
                    <strong>Description:</strong> {budget.description || 'No description available'}
                  </div>
                </div>

                <div className="actions">
                  <label>
                    <input
                      type="checkbox"
                      checked={showOnDashboard[budget.id] || false}
                      onChange={() => handleToggleShowOnDashboard(budget.id)}
                    />
                    Show on Dashboard
                  </label>

                  <button className="edit-btn" onClick={() => handleEdit(budget)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(budget.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default BudgetModification;
