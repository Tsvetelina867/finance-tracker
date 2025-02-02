package com.example.spring.finance.service;

import com.example.spring.finance.dtos.AccountDTO;
import com.example.spring.finance.dtos.CategoryDTO;
import com.example.spring.finance.dtos.GoalDTO;
import com.example.spring.finance.dtos.UserDTO;
import com.example.spring.finance.model.Account;
import com.example.spring.finance.model.Category;
import com.example.spring.finance.model.Goal;
import com.example.spring.finance.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GoalService {
    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;

    public GoalService(GoalRepository goalRepository, UserRepository userRepository, CategoryRepository categoryRepository, AccountRepository accountRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.accountRepository = accountRepository;
    }

    public BigDecimal calculateGoalProgress(Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found with id: " + goalId));

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

        Category category = categoryRepository.findById(goal.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        goal.setCategory(category);

        Account account = accountRepository.findById(goal.getAccount().getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        goal.setAccount(account);

        return goalRepository.save(goal);
    }

    public Goal updateGoal(Long id, GoalDTO goalDTO) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found w"));
        goal.setName(goalDTO.getName());
        goal.setTargetAmount(goalDTO.getTargetAmount());
        goal.setCurrentAmount(goalDTO.getCurrentAmount());
        goal.setDeadline(goalDTO.getDeadline());
        if (goalDTO.getAccount() != null) {
            Account account = accountRepository.findByName(goalDTO.getAccount().getName())
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            goal.setAccount(account);
        }

        if (goalDTO.getCategory() != null) {
            Category category = categoryRepository.findByName(goalDTO.getCategory().getName())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            goal.setCategory(category);
        }

        return goalRepository.save(goal);
    }

    public void deleteGoal(Long id) {
        this.goalRepository.deleteById(id);
    }

    public List<GoalDTO> getGoalsByAccountId(Long accountId) {
        List<Goal> goals = goalRepository.findByAccountId(accountId);

        if (goals.isEmpty()) {
            throw new EntityNotFoundException("No goals found for this account.");
        }

        return goals.stream().map(goal -> new GoalDTO(
                goal.getName(),
                goal.getTargetAmount(),
                goal.getCurrentAmount(),
                goal.getDeadline(),
                new UserDTO(goal.getUser().getUsername(), goal.getUser().getEmail()),
                new AccountDTO(goal.getAccount().getName(), goal.getAccount().getBalance(),
                        goal.getAccount().getCurrency(), goal.getAccount().getType().toString()),
                new CategoryDTO(goal.getCategory().getName(), goal.getCategory().getType().toString())
        )).collect(Collectors.toList());
    }
}

