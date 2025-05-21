package com.example.spring.finance.service;

import com.example.spring.finance.dtos.AccountDTO;
import com.example.spring.finance.dtos.GoalDTO;
import com.example.spring.finance.dtos.UserDTO;
import com.example.spring.finance.model.Account;
import com.example.spring.finance.model.Goal;
import com.example.spring.finance.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
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

    public List<GoalDTO> getGoalsByCategory(Long accountId) {
        List<Goal> goals = goalRepository.findByAccountId(accountId);

        if (goals.isEmpty()) {
            throw new EntityNotFoundException("No goals found for this account.");
        }

        return goals.stream().map(goal -> new GoalDTO(
                goal.getId(),
                goal.getName(),
                goal.getTargetAmount(),
                goal.getCurrentAmount(),
                goal.getDeadline(),
                new UserDTO(goal.getUser().getId(), goal.getUser().getUsername(), goal.getUser().getEmail()),
                new AccountDTO(goal.getAccount().getId(), goal.getAccount().getName(), goal.getAccount().getBalance(),
                        goal.getAccount().getCurrency(), goal.getAccount().getType().toString())
        )).collect(Collectors.toList());
    }

    public String getGoalStatus(Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));

        BigDecimal progress = calculateGoalProgress(goalId);

        if (progress.compareTo(BigDecimal.valueOf(80)) >= 0) {
            return "Near Completion";
        }

        if (goal.getDeadline().isBefore(LocalDate.now())) {
            return "Failed";
        }

        return "In Progress";
    }

    public String estimateCompletionTime(Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));

        BigDecimal progress = calculateGoalProgress(goalId);
        long daysRemaining = goal.getDeadline().toEpochDay() - LocalDate.now().toEpochDay();
        BigDecimal requiredAmount = goal.getTargetAmount().subtract(goal.getCurrentAmount());
        BigDecimal dailyContribution = requiredAmount.divide(BigDecimal.valueOf(daysRemaining), 2, RoundingMode.HALF_UP);

        return "Estimated time to complete: " + dailyContribution.toString() + " per day";
    }

    public void boostGoalProgress(Long goalId, BigDecimal additionalContribution) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new EntityNotFoundException("Goal not found"));

        goal.setCurrentAmount(goal.getCurrentAmount().add(additionalContribution));
        goalRepository.save(goal);
    }

    public List<Goal> getPastGoals(Long userId) {
        return goalRepository.findByUserIdAndDeadlineBefore(userId, LocalDate.now());
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
            Account account = accountRepository.findById(goalDTO.getAccount().getId())
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            goal.setAccount(account);
        }


        return goalRepository.save(goal);
    }

    public void deleteGoal(Long id) {
        this.goalRepository.deleteById(id);
    }

    public List<GoalDTO> getGoalsByAccountId(Long accountId) {
        List<Goal> goals = goalRepository.findByAccountId(accountId);

        if (goals.isEmpty()) {
            return List.of();
        }

        return goals.stream().map(goal -> new GoalDTO(
                goal.getId(),
                goal.getName(),
                goal.getTargetAmount(),
                goal.getCurrentAmount(),
                goal.getDeadline(),
                new UserDTO(goal.getUser().getId(), goal.getUser().getUsername(), goal.getUser().getEmail()),
                new AccountDTO(
                        goal.getAccount().getId(),
                        goal.getAccount().getName(),
                        goal.getAccount().getBalance(),
                        goal.getAccount().getCurrency(),
                        goal.getAccount().getType().toString()
                )
        )).collect(Collectors.toList());
    }


    public GoalDTO getGoalById(Long id) {
        Goal goal = goalRepository.findById(id).orElse(null);
        if (goal != null) {
            return mapGoalToDTO(goal);
        }
        return null;
    }

    private GoalDTO mapGoalToDTO(Goal goal) {
        UserDTO userDTO = new UserDTO(goal.getUser().getId(), goal.getUser().getUsername(), goal.getUser().getEmail());
        AccountDTO accountDTO = new AccountDTO(goal.getAccount().getId(), goal.getAccount().getName(), goal.getAccount().getBalance(),
                goal.getAccount().getCurrency(), goal.getAccount().getType().toString());

        return new GoalDTO(
                goal.getId(),
                goal.getName(),
                goal.getTargetAmount(),
                goal.getCurrentAmount(),
                goal.getDeadline(),
                userDTO,
                accountDTO
        );
    }
}

