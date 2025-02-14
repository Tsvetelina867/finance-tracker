package com.example.spring.finance.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class GoalDTO {
    private Long id;
    private String name;

    @NotNull(message = "Target amount cannot be null.")
    @Positive(message = "Target amount must be greater than zero.")
    private BigDecimal targetAmount;

    @NotNull(message = "Current amount cannot be null.")
    @Positive(message = "Current amount must be greater than zero.")
    private BigDecimal currentAmount;

    @NotNull(message = "Deadline cannot be null.")
    private LocalDate deadline;
    private UserDTO user;
    private AccountDTO account;
}
