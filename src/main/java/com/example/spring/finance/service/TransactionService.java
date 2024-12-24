package com.example.spring.finance.service;

import com.example.spring.finance.model.Account;
import com.example.spring.finance.model.Category;
import com.example.spring.finance.model.Transaction;
import com.example.spring.finance.repository.AccountRepository;
import com.example.spring.finance.repository.CategoryRepository;
import com.example.spring.finance.repository.TransactionRepository;
import com.example.spring.finance.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository, AccountRepository accountRepository, CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
    }
    private void validateAndSetAccountAndCategory(Transaction transaction, Transaction inputTransaction) {
        Account account = accountRepository.findById(inputTransaction.getAccount().getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        transaction.setAccount(account);

        if (inputTransaction.getCategory() != null && inputTransaction.getCategory().getId() != null) {
            Category category = categoryRepository.findById(inputTransaction.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            transaction.setCategory(category);
        } else {
            transaction.setCategory(null);
        }
    }
    public Transaction addTransaction(Transaction transaction) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        transaction.setUser(userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found")));

        validateAndSetAccountAndCategory(transaction, transaction);

        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(Long id, Transaction updatedTransaction) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        validateAndSetAccountAndCategory(transaction, updatedTransaction);

        transaction.setDescription(updatedTransaction.getDescription());
        transaction.setAmount(updatedTransaction.getAmount());
        transaction.setDate(updatedTransaction.getDate());
        transaction.setType(updatedTransaction.getType());

        return transactionRepository.save(transaction);
    }

    public List<Transaction> getTransactionsForCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return transactionRepository.findByUserUsername(username);
    }

    public void deleteTransaction(Long id) {
        this.transactionRepository.deleteById(id);
    }
}
