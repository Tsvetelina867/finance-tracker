import React from 'react';
import GoalCard from './GoalCard'; // Displays each goal separately

const GoalsProgress = ({ goals }) => {
  if (!goals || goals.length === 0) {
    return <p>No goals available for this account.</p>;
  }

  return (
    <div className="goals-container">
      {goals.map(goal => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
};

export default GoalsProgress;
