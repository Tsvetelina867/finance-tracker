package com.example.spring.finance.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class BudgetDTO {
    private String description;
    private BigDecimal budgetLimit;
    private BigDecimal currentSpending;
    private Long categoryId;
    private Long accountId;
    private UserDTO user;



}
