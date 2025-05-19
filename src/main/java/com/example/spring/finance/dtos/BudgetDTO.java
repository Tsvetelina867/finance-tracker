package com.example.spring.finance.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class BudgetDTO {
    private Long id;
    private String description;
    private BigDecimal budgetLimit;
    private BigDecimal currentSpending;
    private LocalDate startDate;
    private LocalDate endDate;
    private CategoryDTO category;
    private AccountDTO account;
    private UserDTO user;

}
