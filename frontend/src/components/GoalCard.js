import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GoalCard.css';

const GoalCard = ({ goal }) => {
  const { id, name, targetAmount, currentAmount, progress, status, deadline, account } = goal;

  // Calculate progress percentage and ensure it doesn't exceed 100%, rounded to the nearest whole number
  const progressPercentage = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);

  // Automatically set status to 'Completed' if progress is 100%
  const goalStatus = progressPercentage === 100 ? 'Completed' : status || 'In Progress';

  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/goals/${id}`); // Navigate to goal details page
  };

  return (
    <div className="goal-card">
      <div className={`goal-card-header ${goalStatus.toLowerCase()}`}>
        <h3>{name}</h3>
        <div className="goal-card-status">
          <span className={`status-icon ${goalStatus.toLowerCase()}`} />
          <span>{goalStatus}</span>
        </div>
      </div>

      <div className="goal-card-body">
        <p>Target: {targetAmount} {account.currency}</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <p>Progress: {progressPercentage}%</p>
        <p>Deadline: {new Date(deadline).toLocaleDateString()}</p>
      </div>

      <div className="goal-card-footer">
        <button className="details-btn" onClick={handleViewDetails}>View Details</button>
      </div>
    </div>
  );
};

export default GoalCard;
