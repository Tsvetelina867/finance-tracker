package com.example.spring.finance.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter
@Setter
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;

}
