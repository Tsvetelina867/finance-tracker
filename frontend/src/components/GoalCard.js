import React from 'react';

const GoalCard = ({ goal }) => {
  return (
    <div className="goal-card">
      <h3>{goal.name}</h3>
      <p>Target: {goal.targetAmount} {goal.currency}</p>
      <p>Progress: {goal.progress || 0}%</p>
      <p>Status: {goal.isAchieved ? 'Achieved 🎉' : 'In Progress'}</p>
    </div>
  );
};

export default GoalCard;
