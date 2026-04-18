import React from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils/dateUtils";
import "../styles/GoalCard.css";

const GoalCard = ({ goal }) => {
  const { id, name, targetAmount, currentAmount, status, deadline, account } =
    goal;
  const navigate = useNavigate();

  const progressPercentage = Math.min(
    Math.round((currentAmount / targetAmount) * 100),
    100,
  );
  const goalStatus =
    progressPercentage === 100 ? "Completed" : status || "In Progress";

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
        <p>
          Target: {targetAmount} {account.currency}
        </p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p>Progress: {progressPercentage}%</p>
        <p>Deadline: {formatDate(deadline)}</p>
      </div>

      <div className="goal-card-footer">
        <button
          className="details-btn"
          onClick={() => navigate(`/goals/${id}`)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default GoalCard;
