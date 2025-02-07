package com.example.spring.finance.controller;

import com.example.spring.finance.dtos.AccountDTO;
import com.example.spring.finance.dtos.CategoryDTO;
import com.example.spring.finance.dtos.TransactionDTO;
import com.example.spring.finance.dtos.UserDTO;
import com.example.spring.finance.model.Transaction;
import com.example.spring.finance.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance/transactions")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class TransactionController {
    @Autowired
    private TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/{accountId}")
    @CrossOrigin(origins = "http://localhost:3000")
    public ResponseEntity<List<TransactionDTO>> getTransactions(
            @PathVariable Long accountId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        List<TransactionDTO> transactions = transactionService.getTransactionsForAccount(accountId, startDate, endDate);

        return ResponseEntity.ok()
                .header("Cache-Control", "no-cache, no-store, must-revalidate")
                .header("Pragma", "no-cache")
                .header("Expires", "0")
                .body(transactions);
    }


    @GetMapping("/{id}/single")
    public ResponseEntity<TransactionDTO> getTransaction(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getTransactionById(id));
    }
    @GetMapping("/search")
    public List<Transaction> searchTransactions(@RequestParam String keyword) {
        return transactionService.searchTransactions(keyword);
    }
    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.addTransaction(transaction));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionDTO> updateTransaction(@PathVariable Long id, @RequestBody TransactionDTO updatedTransactionDTO) {
        Transaction updatedTransaction = transactionService.updateTransaction(id, updatedTransactionDTO);
        TransactionDTO responseDTO = new TransactionDTO(
                updatedTransaction.getId(),
                updatedTransaction.getDescription(),
                updatedTransaction.getAmount(),
                updatedTransaction.getDate(),
                updatedTransaction.getType().toString(),
                new CategoryDTO(
                        updatedTransaction.getCategory().getId(),
                        updatedTransaction.getCategory().getName(),
                        updatedTransaction.getCategory().getType().toString()
                ),
                new AccountDTO(
                        updatedTransaction.getAccount().getId(),
                        updatedTransaction.getAccount().getName(),
                        updatedTransaction.getAccount().getBalance(),
                        updatedTransaction.getAccount().getCurrency(),
                        updatedTransaction.getAccount().getType().toString()
                ),
                new UserDTO(updatedTransaction.getUser().getId(),
                        updatedTransaction.getUser().getUsername(),
                        updatedTransaction.getUser().getEmail()),
                updatedTransaction.getCurrency()
        );
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}
