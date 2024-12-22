package com.example.spring.finance.model;

import com.example.spring.finance.model.enums.FlowType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String name;

    @Enumerated(EnumType.STRING)
    private FlowType type;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

}
