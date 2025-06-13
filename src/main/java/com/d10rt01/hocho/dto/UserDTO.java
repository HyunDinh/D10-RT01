package com.d10rt01.hocho.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO {
    private String username;
    private String password; // Nhận password từ client
    private String email;
    private String phoneNumber;
    private String role;
    private String fullName;
    private LocalDate dateOfBirth;
}