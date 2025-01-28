package com.example.spring.finance.controller;

import com.example.spring.finance.dtos.*;
import com.example.spring.finance.model.ReoccurringTransaction;
import com.example.spring.finance.service.ReoccurringTransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/finance/reoccurring-transactions")
public class ReoccurringTransactionController {
    private final ReoccurringTransactionService reoccurringTransactionService;

    public ReoccurringTransactionController(ReoccurringTransactionService reoccurringTransactionService) {
        this.reoccurringTransactionService = reoccurringTransactionService;
    }

    @GetMapping("/process")
    public ResponseEntity<List<TransactionDTO>> processRecurringTransactions() {
        List<TransactionDTO> transactions = reoccurringTransactionService.processRecurringTransactions();
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/catch-up")
    public ResponseEntity<List<TransactionDTO>> catchUpRecurringTransactions(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        List<TransactionDTO> transactions = reoccurringTransactionService.catchUpRecurringTransactions(startDate, endDate);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping
    public ResponseEntity<ReoccurringTransaction> createReoccurringTransaction(@RequestBody @Valid ReoccurringTransaction reoccurringTransaction) {
        ReoccurringTransaction createdTransaction = reoccurringTransactionService.addReoccurringTransaction(reoccurringTransaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTransaction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReoccurringTransactionDTO> updateReoccurringTransaction(@PathVariable Long id, @RequestBody ReoccurringTransactionDTO updatedReoccurringTransactionDTO) {
        ReoccurringTransaction updatedReoccurringTransaction = reoccurringTransactionService.updateReoccurringTransaction(id, updatedReoccurringTransactionDTO);

        ReoccurringTransactionDTO responseDTO = new ReoccurringTransactionDTO(
                updatedReoccurringTransaction.getDescription(),
                updatedReoccurringTransaction.getAmount(),
                updatedReoccurringTransaction.getStartDate(),
                updatedReoccurringTransaction.getEndDate(),
                updatedReoccurringTransaction.getFrequency().toString(),
                new CategoryDTO(
                        updatedReoccurringTransaction.getCategory().getName(),
                        updatedReoccurringTransaction.getCategory().getType().toString()
                ),
                new AccountDTO(
                        updatedReoccurringTransaction.getAccount().getName(),
                        updatedReoccurringTransaction.getAccount().getType().toString()
                ),
                new UserDTO(
                        updatedReoccurringTransaction.getUser().getUsername(),
                        updatedReoccurringTransaction.getUser().getEmail()),
                updatedReoccurringTransaction.getCurrency()
        );
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReoccurringTransaction(@PathVariable Long id) {
        reoccurringTransactionService.deleteReoccurringTransaction(id);
        return ResponseEntity.noContent().build();
    }

}
