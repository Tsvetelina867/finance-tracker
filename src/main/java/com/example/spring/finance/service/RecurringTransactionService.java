package com.example.spring.finance.service;

import com.example.spring.finance.dtos.RecurringTransactionDTO;
import com.example.spring.finance.dtos.TransactionDTO;
import com.example.spring.finance.model.Account;
import com.example.spring.finance.model.Category;
import com.example.spring.finance.model.RecurringTransaction;
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
public class RecurringTransactionService {
    private final TransactionRepository transactionRepository;
    private final RecurringTransactionRepository recurringTransactionRepository; // Fixed spelling
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;
    private final ExchangeRateService exchangeRateService;

    public RecurringTransactionService(TransactionRepository transactionRepository,
                                       RecurringTransactionRepository recurringTransactionRepository, // Fixed spelling
                                       UserRepository userRepository,
                                       CategoryRepository categoryRepository,
                                       AccountRepository accountRepository,
                                       ExchangeRateService exchangeRateService) {
        this.transactionRepository = transactionRepository;
        this.recurringTransactionRepository = recurringTransactionRepository; // Fixed spelling
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.accountRepository = accountRepository;
        this.exchangeRateService = exchangeRateService;
    }

    public List<TransactionDTO> processRecurringTransactions(Long accountId) {
        return processRecurringTransactions(accountId, LocalDate.now(), LocalDate.now());
    }

    public List<TransactionDTO> catchUpRecurringTransactions(Long accountId, LocalDate startDate, LocalDate endDate, String frequency, String category) {
        return processRecurringTransactions(accountId, startDate, endDate, frequency, category);
    }

    private List<TransactionDTO> processRecurringTransactions(Long accountId, LocalDate startDate, LocalDate endDate) {
        return processRecurringTransactions(accountId, startDate, endDate, null, null);
    }

    private List<TransactionDTO> processRecurringTransactions(Long accountId, LocalDate startDate, LocalDate endDate, String frequencyFilter, String categoryFilter) {
        List<RecurringTransaction> recurringTransactions = recurringTransactionRepository.findByAccountId(accountId); // Filter by account

        List<Transaction> generatedTransactions = new ArrayList<>();

        for (RecurringTransaction recurringTransaction : recurringTransactions) {
            if (frequencyFilter != null && !recurringTransaction.getFrequency().toString().equals(frequencyFilter)) {
                continue;
            }
            if (categoryFilter != null && recurringTransaction.getCategory() != null &&
                    !recurringTransaction.getCategory().getName().equals(categoryFilter)) {
                continue;
            }

            LocalDate currentDate = recurringTransaction.getStartDate();
            endDate = (recurringTransaction.getEndDate() != null && recurringTransaction.getEndDate().isBefore(endDate)) ?
                    recurringTransaction.getEndDate() : endDate;

            while (!currentDate.isAfter(endDate)) {
                boolean transactionExists = transactionRepository.existsByDescriptionAndAmountAndDateAndUser(
                        recurringTransaction.getDescription(),
                        recurringTransaction.getAmount(),
                        currentDate,
                        recurringTransaction.getUser()
                );

                if (!transactionExists) {
                    Transaction transaction = getTransaction(recurringTransaction, currentDate);
                    generatedTransactions.add(transaction);
                }

                switch (recurringTransaction.getFrequency()) {
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

    private static Transaction getTransaction(RecurringTransaction recurringTransaction, LocalDate currentDate) {
        Transaction transaction = new Transaction();
        transaction.setDescription(recurringTransaction.getDescription());
        transaction.setAmount(recurringTransaction.getAmount());
        transaction.setDate(currentDate);
        transaction.setType(FlowType.EXPENSE);
        transaction.setCategory(recurringTransaction.getCategory());
        transaction.setAccount(recurringTransaction.getAccount());
        transaction.setUser(recurringTransaction.getUser());
        return transaction;
    }

    public RecurringTransaction addRecurringTransaction(RecurringTransaction recurringTransaction) { // Fixed spelling
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        recurringTransaction.setUser(userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found")));

        if (recurringTransaction.getCategory() != null) {
            Category category = categoryRepository.findById(recurringTransaction.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            recurringTransaction.setCategory(category);
        }

        Account account = accountRepository.findById(recurringTransaction.getAccount().getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        recurringTransaction.setAccount(account);

        if (recurringTransaction.getCurrency() == null) {
            throw new IllegalArgumentException("Currency must be provided for the recurring transaction.");
        }

        BigDecimal convertedAmount = convertToAccountCurrency(recurringTransaction);
        recurringTransaction.setAmount(convertedAmount);

        return recurringTransactionRepository.save(recurringTransaction);
    }

    public RecurringTransaction updateRecurringTransaction(Long id, RecurringTransactionDTO updatedRecurringTransactionDTO) { // Fixed spelling
        RecurringTransaction recurringTransaction = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurring transaction not found")); // Fixed spelling

        recurringTransaction.setDescription(updatedRecurringTransactionDTO.getDescription());
        recurringTransaction.setAmount(updatedRecurringTransactionDTO.getAmount());
        recurringTransaction.setStartDate(updatedRecurringTransactionDTO.getStartDate());
        recurringTransaction.setEndDate(updatedRecurringTransactionDTO.getEndDate());
        recurringTransaction.setFrequency(FrequencyType.valueOf(updatedRecurringTransactionDTO.getFrequency()));
        recurringTransaction.setCurrency(updatedRecurringTransactionDTO.getCurrency());

        if (updatedRecurringTransactionDTO.getCategory().getName() != null) {
            Category category = categoryRepository.findByName(updatedRecurringTransactionDTO.getCategory().getName())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            category.setType(FlowType.valueOf(updatedRecurringTransactionDTO.getCategory().getType()));
            recurringTransaction.setCategory(category);
        } else {
            recurringTransaction.setCategory(null);
        }

        Account account = accountRepository.findByName(updatedRecurringTransactionDTO.getAccount().getName())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        recurringTransaction.setAccount(account);

        return recurringTransactionRepository.save(recurringTransaction);
    }

    public void deleteRecurringTransaction(Long id) { // Fixed spelling
        this.recurringTransactionRepository.deleteById(id); // Fixed spelling
    }

    public BigDecimal convertToAccountCurrency(RecurringTransaction recurringTransaction) { // Fixed spelling
        String accountCurrency = recurringTransaction.getAccount().getCurrency();
        String transactionCurrency = recurringTransaction.getCurrency();  // You can optionally store the transaction currency if needed

        if (!transactionCurrency.equals(accountCurrency)) {
            BigDecimal exchangeRate = exchangeRateService.getExchangeRate(transactionCurrency, accountCurrency);
            return recurringTransaction.getAmount().multiply(exchangeRate);
        } else {
            return recurringTransaction.getAmount();
        }
    }
}

