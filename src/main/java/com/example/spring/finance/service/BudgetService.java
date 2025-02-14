package com.example.spring.finance.service;

import com.example.spring.finance.dtos.AccountDTO;
import com.example.spring.finance.dtos.BudgetDTO;
import com.example.spring.finance.dtos.CategoryDTO;
import com.example.spring.finance.dtos.UserDTO;
import com.example.spring.finance.model.Account;
import com.example.spring.finance.model.Budget;
import com.example.spring.finance.model.Category;
import com.example.spring.finance.model.User;
import com.example.spring.finance.model.enums.FlowType;
import com.example.spring.finance.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

        if (updatedBudgetDTO.getCategory() != null) {
            Category category = categoryRepository.findById(updatedBudgetDTO.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + updatedBudgetDTO.getCategory().getId()));
            budget.setCategory(category);
        } else {
            budget.setCategory(null);
        }

        Account account = accountRepository.findById(updatedBudgetDTO.getAccount().getId())
                .orElseThrow(() -> new RuntimeException("Account not found with ID: " + updatedBudgetDTO.getAccount().getId()));

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

        if (budget.getAccount() == null) {
            throw new RuntimeException("Account must be provided for the budget");
        }

        Account account = accountRepository.findById(budget.getAccount().getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        budget.setAccount(account);

        return budgetRepository.save(budget);
    }


    public void deleteBudget(Long id) {
        this.budgetRepository.deleteById(id);
    }
    public List<BudgetDTO> getBudgetsByAccountId(Long accountId) {
        List<Budget> budgets = budgetRepository.findAllByAccountId(accountId);

        if (budgets.isEmpty()) {
            throw new EntityNotFoundException("No budgets found for account ID: " + accountId);
        }

        return budgets.stream().map(budget -> {
            BigDecimal totalSpending = transactionRepository.sumByCategoryAndAccountAndDateRange(
                    budget.getCategory(),
                    budget.getAccount(),
                    budget.getStartDate(),
                    budget.getEndDate()
            );

            if (totalSpending == null) {
                totalSpending = BigDecimal.ZERO;
            }

            // Handle null Category
            CategoryDTO categoryDTO = null;
            if (budget.getCategory() != null) {
                categoryDTO = new CategoryDTO(
                        budget.getCategory().getId(),
                        budget.getCategory().getName()
                );
            }

            // Handle null User and Account
            UserDTO userDTO = (budget.getUser() != null) ?
                    new UserDTO(budget.getUser().getId(), budget.getUser().getUsername(), budget.getUser().getEmail()) :
                    null;

            AccountDTO accountDTO = (budget.getAccount() != null) ?
                    new AccountDTO(budget.getAccount().getId(), budget.getAccount().getName(), budget.getAccount().getBalance(), budget.getAccount().getCurrency(), budget.getAccount().getType().toString()) :
                    null;

            return new BudgetDTO(
                    budget.getId(),
                    budget.getDescription(),
                    budget.getBudgetLimit(),
                    totalSpending, // Current spending
                    budget.getStartDate(),
                    budget.getEndDate(),
                    categoryDTO,
                    accountDTO,
                    userDTO
            );
        }).collect(Collectors.toList());
    }



    public BudgetDTO getBudgetByAccountId(Long accountId) {
        Optional<Budget> budgetOpt = budgetRepository.findByAccountId(accountId);

        if (budgetOpt.isEmpty()) {
            throw new EntityNotFoundException("No budget found for this account.");
        }

        Budget budget = budgetOpt.get();
        return new BudgetDTO(
                budget.getId(),
                budget.getDescription(),
                budget.getBudgetLimit(),
                budget.getCurrentSpending(),
                budget.getStartDate(),
                budget.getEndDate(),
                new CategoryDTO(
                        budget.getCategory().getId(),
                        budget.getCategory().getName()
                ),
                new AccountDTO(
                        budget.getAccount().getId(),
                        budget.getAccount().getName(),
                        budget.getAccount().getBalance(),
                        budget.getAccount().getCurrency(),
                        budget.getAccount().getType().toString()
                ),
                new UserDTO(
                        budget.getUser().getId(),
                        budget.getUser().getUsername(),
                        budget.getUser().getEmail()
                )

        );
    }

    public BudgetDTO getBudgetById(Long id) {
        Optional<Budget> budgetOpt = budgetRepository.findById(id);

        if (budgetOpt.isEmpty()) {
            throw new EntityNotFoundException("No budget found with this id.");
        }

        Budget budget = budgetOpt.get();
        return new BudgetDTO(
                budget.getId(),
                budget.getDescription(),
                budget.getBudgetLimit(),
                budget.getCurrentSpending(),
                budget.getStartDate(),
                budget.getEndDate(),
                new CategoryDTO(
                        budget.getCategory().getId(),
                        budget.getCategory().getName()
                ),
                new AccountDTO(
                        budget.getAccount().getId(),
                        budget.getAccount().getName(),
                        budget.getAccount().getBalance(),
                        budget.getAccount().getCurrency(),
                        budget.getAccount().getType().toString()
                ),
                new UserDTO(
                        budget.getUser().getId(),
                        budget.getUser().getUsername(),
                        budget.getUser().getEmail()
                )

        );
    }

}


