package d10_rt01.hocho.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class LoginRequest {

    private String username;
    private String password;
    private boolean rememberMe;
}