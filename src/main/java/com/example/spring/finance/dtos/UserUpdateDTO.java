package com.example.spring.finance.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateDTO {
    private Long id;
    private String username;
    private String password;
}
