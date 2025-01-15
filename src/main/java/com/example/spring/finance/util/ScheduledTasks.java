package com.example.spring.finance.util;

import com.example.spring.finance.service.ReoccurringTransactionService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ScheduledTasks {
    private final ReoccurringTransactionService reoccurringTransactionService;

    public ScheduledTasks(ReoccurringTransactionService reoccurringTransactionService) {
        this.reoccurringTransactionService = reoccurringTransactionService;
    }

    @Scheduled(cron = "0 0 0 * * *") // Daily at midnight
    public void processRecurringTransactionsDaily() {
        System.out.println("Scheduled task running at: " + LocalDateTime.now());
        reoccurringTransactionService.processRecurringTransactions();
    }
}

