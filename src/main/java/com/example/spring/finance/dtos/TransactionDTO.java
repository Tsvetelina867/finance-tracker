package com.example.spring.finance.dtos;

import com.example.spring.finance.model.Transaction;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class TransactionDTO {
    private Long id;
    private String description;
    private BigDecimal amount;
    private LocalDate date;
    private String type;
    private Long categoryId;
    private Long accountId;
    private UserDTO user;

    public TransactionDTO(Transaction transaction) { //this is for the reoccuring transactions
        this.id = transaction.getId();
        this.description = transaction.getDescription();
        this.amount = transaction.getAmount();
        this.date = transaction.getDate();
        this.type = transaction.getType().toString();
    }

}
