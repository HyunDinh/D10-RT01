package d10_rt01.hocho.dto;

public class LoginResponse {
    private String username;

    public LoginResponse(String username) {
        this.username = username;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}