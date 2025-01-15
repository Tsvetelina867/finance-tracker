package com.example.spring.finance.dtos;

import com.example.spring.finance.model.Transaction;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class TransactionDTO {
    private Long id;
    private String description;
    private BigDecimal amount;
    private LocalDate date;
    private String type;
    private Long categoryId;
    private Long accountId;
    private UserDTO user;

    public TransactionDTO(Long id, String description, BigDecimal amount, LocalDate date, String type, Long categoryId, Long accountId, UserDTO user) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.date = date;
        this.type = type;
        this.categoryId = categoryId;
        this.accountId = accountId;
        this.user = user;
    }
    public TransactionDTO(Transaction transaction) { //this is for the reoccuring transactions
        this.id = transaction.getId();
        this.description = transaction.getDescription();
        this.amount = transaction.getAmount();
        this.date = transaction.getDate();
        this.type = transaction.getType().toString();
    }

}
