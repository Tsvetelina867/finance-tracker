package com.example.spring.finance.service;

import com.example.spring.finance.dtos.BudgetDTO;
import com.example.spring.finance.dtos.UserDTO;
import com.example.spring.finance.model.Account;
import com.example.spring.finance.model.Budget;
import com.example.spring.finance.model.Category;
import com.example.spring.finance.model.User;
import com.example.spring.finance.model.enums.FlowType;
import com.example.spring.finance.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
public class BudgetService {
    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public BudgetService(BudgetRepository budgetRepository, TransactionRepository transactionRepository, CategoryRepository categoryRepository, AccountRepository accountRepository, UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    public BigDecimal calculateBudgetProgress(Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found with id: " + budgetId));


        BigDecimal totalSpending = transactionRepository.sumByCategoryAndAccountAndDateRange(
                budget.getCategory(),
                budget.getAccount(),
                budget.getStartDate(),
                budget.getEndDate()
        );

        if (totalSpending == null) {
            totalSpending = BigDecimal.ZERO;
        }

        BigDecimal progress = totalSpending.divide(budget.getBudgetLimit(), 2, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
        return progress.min(BigDecimal.valueOf(100));
    }

    public boolean isBudgetExceeded(Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found with id: " + budgetId));

        BigDecimal totalSpending = transactionRepository.sumByCategoryAndAccountAndDateRange(
                budget.getCategory(),
                budget.getAccount(),
                budget.getStartDate(),
                budget.getEndDate()
        );

        return totalSpending != null && totalSpending.compareTo(budget.getBudgetLimit()) > 0;
    }

    public Budget updateBudget(Long id, BudgetDTO updatedBudgetDTO) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found with ID: " + id));

        budget.setDescription(updatedBudgetDTO.getDescription());
        budget.setBudgetLimit(updatedBudgetDTO.getBudgetLimit());
        budget.setStartDate(updatedBudgetDTO.getStartDate());
        budget.setEndDate(updatedBudgetDTO.getEndDate());


        if (updatedBudgetDTO.getCurrentSpending() != null) {
            throw new IllegalArgumentException("Current spending cannot be updated manually.");
        }

        if (updatedBudgetDTO.getCategory() != null) {
            Category category = categoryRepository.findByName(updatedBudgetDTO.getCategory().getName())
                    .orElseThrow(() -> new RuntimeException("Category not found with name: " + updatedBudgetDTO.getCategory().getName()));
            category.setType(FlowType.valueOf(updatedBudgetDTO.getCategory().getType()));
            budget.setCategory(category);
        } else {
            budget.setCategory(null);
        }

        Account account = accountRepository.findByName(updatedBudgetDTO.getAccount().getName())
                .orElseThrow(() -> new RuntimeException("Account not found with name: " + updatedBudgetDTO.getAccount().getName()));
        budget.setAccount(account);

        return budgetRepository.save(budget);
    }


    public Budget addBudget(Budget budget) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        budget.setUser(userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found")));

        Category category = categoryRepository.findById(budget.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        budget.setCategory(category);

        Account account = accountRepository.findById(budget.getAccount().getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        budget.setAccount(account);


        return budgetRepository.save(budget);
    }

    public void deleteBudget(Long id) {
        this.budgetRepository.deleteById(id);
    }
}


