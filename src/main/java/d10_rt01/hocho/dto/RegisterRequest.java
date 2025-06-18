package d10_rt01.hocho.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RegisterRequest {
    // Getters and setters
    private String username;
    private String password;
    private String retypePassword;
    private String email;
    private String parentEmail;
    private String role;
    private String phoneNumber;
}