package com.example.spring.finance.controller;

import com.example.spring.finance.dtos.*;
import com.example.spring.finance.model.RecurringTransaction;
import com.example.spring.finance.service.RecurringTransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/finance/recurring-transactions")
@CrossOrigin(origins = "http://localhost:3000")
public class RecurringTransactionController {
    private final RecurringTransactionService recurringTransactionService;

    public RecurringTransactionController(RecurringTransactionService recurringTransactionService) {
        this.recurringTransactionService = recurringTransactionService;
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<List<RecurringTransactionDTO>> processRecurringTransactions(@PathVariable Long accountId) {
        List<RecurringTransactionDTO> transactions = recurringTransactionService.processRecurringTransactions(accountId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/catch-up")
    public ResponseEntity<List<RecurringTransactionDTO>> catchUpRecurringTransactions(
            @RequestParam Long accountId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam(required = false) String frequency,
            @RequestParam(required = false) String category) {
        List<RecurringTransactionDTO> transactions = recurringTransactionService.catchUpRecurringTransactions(accountId, startDate, endDate, frequency, category);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping
    public ResponseEntity<RecurringTransaction> createRecurringTransaction(@RequestBody @Valid RecurringTransaction recurringTransaction) {
        RecurringTransaction createdTransaction = recurringTransactionService.addRecurringTransaction(recurringTransaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTransaction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecurringTransactionDTO> updateRecurringTransaction(
            @PathVariable Long id,
            @RequestBody RecurringTransactionDTO updatedRecurringTransactionDTO) {
        RecurringTransaction updatedRecurringTransaction = recurringTransactionService.updateRecurringTransaction(id, updatedRecurringTransactionDTO);
        RecurringTransactionDTO responseDTO = new RecurringTransactionDTO(
                updatedRecurringTransaction.getId(),
                updatedRecurringTransaction.getDescription(),
                updatedRecurringTransaction.getAmount(),
                updatedRecurringTransaction.getStartDate(),
                updatedRecurringTransaction.getEndDate(),
                updatedRecurringTransaction.getFrequency().toString(),
                new CategoryDTO(
                        updatedRecurringTransaction.getCategory().getId(),
                        updatedRecurringTransaction.getCategory().getName()
                ),
                new AccountDTO(
                        updatedRecurringTransaction.getAccount().getId(),
                        updatedRecurringTransaction.getAccount().getName(),
                        updatedRecurringTransaction.getAccount().getBalance(),
                        updatedRecurringTransaction.getAccount().getCurrency(),
                        updatedRecurringTransaction.getAccount().getType().toString()
                ),
                new UserDTO(
                        updatedRecurringTransaction.getUser().getId(),
                        updatedRecurringTransaction.getUser().getUsername(),
                        updatedRecurringTransaction.getUser().getEmail()),
                updatedRecurringTransaction.getCurrency()
        );
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecurringTransaction(@PathVariable Long id) {
        recurringTransactionService.deleteRecurringTransaction(id);
        return ResponseEntity.noContent().build();
    }
}

