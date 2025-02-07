package com.example.spring.finance.controller;

import com.example.spring.finance.dtos.AccountDTO;
import com.example.spring.finance.dtos.BudgetDTO;
import com.example.spring.finance.dtos.CategoryDTO;
import com.example.spring.finance.dtos.UserDTO;
import com.example.spring.finance.model.Budget;
import com.example.spring.finance.repository.BudgetRepository;
import com.example.spring.finance.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/finance/budgets")
@CrossOrigin(origins = "http://localhost:3000")
public class BudgetController {
    private final BudgetService budgetService;


    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping("/{accountId}/single")
    public ResponseEntity<BudgetDTO> getBudgetForAccount(@PathVariable Long accountId) {
        BudgetDTO budget = budgetService.getBudgetByAccountId(accountId);
        return ResponseEntity.ok(budget);
    }
    @GetMapping("/{accountId}")
    public ResponseEntity<List<BudgetDTO>> getBudgetsForAccount(@PathVariable Long accountId) {
        List<BudgetDTO> budgets = budgetService.getBudgetsByAccountId(accountId);
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/{budgetId}/progress")
    public ResponseEntity<BigDecimal> getBudgetProgress(@PathVariable Long budgetId) {
        BigDecimal progress = budgetService.calculateBudgetProgress(budgetId);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/{budgetId}/exceeded")
    public ResponseEntity<Boolean> isBudgetExceeded(@PathVariable Long budgetId) {
        boolean exceeded = budgetService.isBudgetExceeded(budgetId);
        return ResponseEntity.ok(exceeded);
    }

    @PostMapping
    public ResponseEntity<Budget> createBudget(@RequestBody @Valid Budget budget) {
        Budget createdBudget = budgetService.addBudget(budget);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBudget);
    }


    @PutMapping("/{id}")
    public ResponseEntity<BudgetDTO> updateBudget(@PathVariable Long id, @RequestBody BudgetDTO updatedBudgetDTO) {
        Budget budget = budgetService.updateBudget(id, updatedBudgetDTO);

        BudgetDTO responseDTO = new BudgetDTO(
                budget.getId(),
                budget.getDescription(),
                budget.getBudgetLimit(),
                budget.getCurrentSpending(),
                budget.getStartDate(),
                budget.getEndDate(),
                new CategoryDTO(
                        budget.getCategory().getId(),
                        budget.getCategory().getName(),
                        budget.getCategory().getType().toString()
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
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}

