import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/GoalCard.css';

const GoalCard = ({ goal }) => {
  const { id, name, targetAmount, currentAmount, progress, status, deadline, account } = goal;

  const progressPercentage = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);

  const goalStatus = progressPercentage === 100 ? 'Completed' : status || 'In Progress';

  const navigate = useNavigate();
   const formatDate = (dateValue) => {
       if (!dateValue) return '';

       let day, month, year;

       if (Array.isArray(dateValue)) {
         if (dateValue.length !== 3) {
           return '';
         }

         year = dateValue[0];
         month = dateValue[1];
         day = dateValue[2];
       }
       else if (typeof dateValue === 'string') {
         const date = new Date(dateValue);
         if (isNaN(date.getTime())) {
           return '';
         }
         day = date.getUTCDate();
         month = date.getUTCMonth() + 1;
         year = date.getUTCFullYear();
       }
       else if (dateValue instanceof Date) {
         if (isNaN(dateValue.getTime())) {
           return '';
         }
         day = dateValue.getUTCDate();
         month = dateValue.getUTCMonth() + 1;
         year = dateValue.getUTCFullYear();
       }
       else {
         return '';
       }

       return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
     };

  const handleViewDetails = () => {
    navigate(`/goals/${id}`);
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
