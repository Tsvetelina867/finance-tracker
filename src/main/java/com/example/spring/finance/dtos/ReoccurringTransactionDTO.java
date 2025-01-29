package com.example.spring.finance.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class ReoccurringTransactionDTO {
    private String description;
    private BigDecimal amount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String frequency;
    private CategoryDTO category;
    private AccountDTO account;
    private UserDTO user;
    private String currency;
}
