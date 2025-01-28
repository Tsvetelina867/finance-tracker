package com.example.spring.finance.service;

import com.example.spring.finance.dtos.ReoccurringTransactionDTO;
import com.example.spring.finance.dtos.TransactionDTO;
import com.example.spring.finance.model.Account;
import com.example.spring.finance.model.Category;
import com.example.spring.finance.model.ReoccurringTransaction;
import com.example.spring.finance.model.Transaction;
import com.example.spring.finance.model.enums.FlowType;
import com.example.spring.finance.model.enums.FrequencyType;
import com.example.spring.finance.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReoccurringTransactionService {
    private final TransactionRepository transactionRepository;
    private final ReoccurringTransactionRepository reoccurringTransactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;
    private final ExchangeRateService exchangeRateService;

    public ReoccurringTransactionService(TransactionRepository transactionRepository, ReoccurringTransactionRepository reoccurringTransactionRepository, UserRepository userRepository, CategoryRepository categoryRepository, AccountRepository accountRepository, ExchangeRateService exchangeRateService) {
        this.transactionRepository = transactionRepository;
        this.reoccurringTransactionRepository = reoccurringTransactionRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.accountRepository = accountRepository;
        this.exchangeRateService = exchangeRateService;

    }

    public List<TransactionDTO> processRecurringTransactions() {
        return processRecurringTransactions(LocalDate.now(), LocalDate.now());
    }

    public List<TransactionDTO> catchUpRecurringTransactions(LocalDate startDate, LocalDate endDate) {
        return processRecurringTransactions(startDate, endDate);
    }

    private List<TransactionDTO> processRecurringTransactions(LocalDate startDate, LocalDate endDate) {
        List<ReoccurringTransaction> reoccurringTransactions = reoccurringTransactionRepository.findAll();

        List<Transaction> generatedTransactions = new ArrayList<>();

        for (ReoccurringTransaction reoccurringTransaction : reoccurringTransactions) {
            LocalDate currentDate = reoccurringTransaction.getStartDate();

            endDate = (reoccurringTransaction.getEndDate() != null && reoccurringTransaction.getEndDate().isBefore(endDate)) ?
                    reoccurringTransaction.getEndDate() : endDate;

            while (!currentDate.isAfter(endDate)) {
                boolean transactionExists = transactionRepository.existsByDescriptionAndAmountAndDateAndUser(
                        reoccurringTransaction.getDescription(),
                        reoccurringTransaction.getAmount(),
                        currentDate,
                        reoccurringTransaction.getUser()
                );

                if (!transactionExists) {
                    Transaction transaction = getTransaction(reoccurringTransaction, currentDate);
                    generatedTransactions.add(transaction);
                }

                switch (reoccurringTransaction.getFrequency()) {
                    case DAILY -> currentDate = currentDate.plusDays(1);
                    case WEEKLY -> currentDate = currentDate.plusWeeks(1);
                    case MONTHLY -> currentDate = currentDate.plusMonths(1);
                    case ANNUALLY -> currentDate = currentDate.plusYears(1);
                }
            }
        }

        transactionRepository.saveAll(generatedTransactions);
        return generatedTransactions.stream()
                .map(TransactionDTO::new)
                .collect(Collectors.toList());
    }

    private static Transaction getTransaction(ReoccurringTransaction reoccurringTransaction, LocalDate currentDate) {
        Transaction transaction = new Transaction();
        transaction.setDescription(reoccurringTransaction.getDescription());
        transaction.setAmount(reoccurringTransaction.getAmount());
        transaction.setDate(currentDate);
        transaction.setType(FlowType.EXPENSE);
        transaction.setCategory(reoccurringTransaction.getCategory());
        transaction.setAccount(reoccurringTransaction.getAccount());
        transaction.setUser(reoccurringTransaction.getUser());
        return transaction;
    }

    public ReoccurringTransaction addReoccurringTransaction(ReoccurringTransaction reoccurringTransaction) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // Set the user
        reoccurringTransaction.setUser(userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found")));

        // Set the category if provided
        if (reoccurringTransaction.getCategory() != null && reoccurringTransaction.getCategory().getId() != null) {
            Category category = categoryRepository.findById(reoccurringTransaction.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            reoccurringTransaction.setCategory(category);
        }

        // Validate and set the account
        if (reoccurringTransaction.getAccount() == null || reoccurringTransaction.getAccount().getId() == null) {
            throw new RuntimeException("Account must be provided and must have a valid ID.");
        }
        Account account = accountRepository.findById(reoccurringTransaction.getAccount().getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        reoccurringTransaction.setAccount(account);

        if (reoccurringTransaction.getCurrency() == null) {
            throw new IllegalArgumentException("Currency must be provided for the recurring transaction.");
        }

        // Convert the amount to the account's currency
        BigDecimal convertedAmount = convertToAccountCurrency(reoccurringTransaction);
        reoccurringTransaction.setAmount(convertedAmount);


        // Save and return the transaction
        return reoccurringTransactionRepository.save(reoccurringTransaction);
    }

    public ReoccurringTransaction updateReoccurringTransaction(Long id, ReoccurringTransactionDTO updatedReoccurringTransactionDTO) {
        ReoccurringTransaction reoccurringTransaction = reoccurringTransactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reoccurring transaction not found"));

        reoccurringTransaction.setDescription(updatedReoccurringTransactionDTO.getDescription());
        reoccurringTransaction.setAmount(updatedReoccurringTransactionDTO.getAmount());
        reoccurringTransaction.setStartDate(updatedReoccurringTransactionDTO.getStartDate());
        reoccurringTransaction.setEndDate(updatedReoccurringTransactionDTO.getEndDate());
        reoccurringTransaction.setFrequency(FrequencyType.valueOf(updatedReoccurringTransactionDTO.getFrequency()));
        reoccurringTransaction.setCurrency(updatedReoccurringTransactionDTO.getCurrency());

        if (updatedReoccurringTransactionDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(updatedReoccurringTransactionDTO.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            reoccurringTransaction.setCategory(category);
        } else {
            reoccurringTransaction.setCategory(null);
        }

        Account account = accountRepository.findById(updatedReoccurringTransactionDTO.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        reoccurringTransaction.setAccount(account);

        return reoccurringTransactionRepository.save(reoccurringTransaction);

    }

    public void deleteReoccurringTransaction(Long id) {
        this.reoccurringTransactionRepository.deleteById(id);
    }

    public BigDecimal convertToAccountCurrency(ReoccurringTransaction reoccurringTransaction) {
        String accountCurrency = reoccurringTransaction.getAccount().getCurrency();
        String transactionCurrency = reoccurringTransaction.getCurrency();  // You can optionally store the transaction currency if needed

        if (!transactionCurrency.equals(accountCurrency)) {
            // Perform the conversion using the exchange rates API
            BigDecimal exchangeRate = exchangeRateService.getExchangeRate(transactionCurrency, accountCurrency);
            return reoccurringTransaction.getAmount().multiply(exchangeRate);
        } else {
            // If the currencies are the same, no conversion is needed
            return reoccurringTransaction.getAmount();
        }
    }
}
