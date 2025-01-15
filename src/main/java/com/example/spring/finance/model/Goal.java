package com.example.spring.finance.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
public class Goal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String name;

    @NotNull
    @Positive
    private BigDecimal targetAmount;

    @NotNull
    @PositiveOrZero
    private BigDecimal currentAmount = BigDecimal.ZERO;

    @Future
    private LocalDateTime deadline;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    public BigDecimal getProgress() {
        return this.currentAmount.divide(this.targetAmount, 2, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
    }

}
