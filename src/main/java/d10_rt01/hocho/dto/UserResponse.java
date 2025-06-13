package d10_rt01.hocho.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UserResponse {
    private String username;
    private String email;
    private String fullName;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String role;
    private String avatarUrl;
    private boolean isActive;
    private boolean verified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}