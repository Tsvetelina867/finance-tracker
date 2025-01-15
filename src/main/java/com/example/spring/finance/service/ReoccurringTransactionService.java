package com.example.spring.finance.service;

import com.example.spring.finance.dtos.TransactionDTO;
import com.example.spring.finance.model.ReoccurringTransaction;
import com.example.spring.finance.model.Transaction;
import com.example.spring.finance.model.enums.FlowType;
import com.example.spring.finance.repository.ReoccurringTransactionRepository;
import com.example.spring.finance.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReoccurringTransactionService {
    private final TransactionRepository transactionRepository;
    private final ReoccurringTransactionRepository reoccurringTransactionRepository;

    public ReoccurringTransactionService(TransactionRepository transactionRepository, ReoccurringTransactionRepository reoccurringTransactionRepository) {
        this.transactionRepository = transactionRepository;
        this.reoccurringTransactionRepository = reoccurringTransactionRepository;
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
}
