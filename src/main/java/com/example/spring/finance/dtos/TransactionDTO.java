package com.example.spring.finance.dtos;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class TransactionDTO {
    private Long id;
    private String description;
    private BigDecimal amount;
    private LocalDateTime date;
    private String type;
    private Long categoryId;
    private Long accountId;
    private UserDTO user;

    public TransactionDTO(Long id, String description, BigDecimal amount, LocalDateTime date, String type, Long categoryId, Long accountId, UserDTO user) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.date = date;
        this.type = type;
        this.categoryId = categoryId;
        this.accountId = accountId;
        this.user = user;
    }
}
