package com.example.spring.finance.service;

import com.example.spring.finance.dtos.GoalDTO;
import com.example.spring.finance.model.Account;
import com.example.spring.finance.model.Category;
import com.example.spring.finance.model.Goal;
import com.example.spring.finance.repository.GoalRepository;
import com.example.spring.finance.repository.TransactionRepository;
import com.example.spring.finance.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class GoalService {
    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public GoalService(GoalRepository goalRepository, UserRepository userRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
    }

    public BigDecimal calculateGoalProgress(Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found with id: " + goalId));

        // Calculate progress as a percentage
        return goal.getCurrentAmount()
                .divide(goal.getTargetAmount(), 2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    public boolean isGoalAchieved(Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found with id: " + goalId));

        return goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0;
    }

    public Goal addGoal(Goal goal) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        goal.setUser(userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found")));

        return goalRepository.save(goal);
    }

    public Goal updateGoal(Long id, GoalDTO goalDTO) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        goal.setName(goalDTO.getName());
        goal.setTargetAmount(goalDTO.getTargetAmount());
        goal.setCurrentAmount(goalDTO.getCurrentAmount());
        goal.setDeadline(goalDTO.getDeadline());

        return goalRepository.save(goal);
    }

    public void deleteGoal(Long id) {
        this.goalRepository.deleteById(id);
    }
}

