package d10_rt01.hocho.dto;

public class RegisterRequest {
    private String username;
    private String password;
    private String retypePassword;
    private String email;
    private String parentEmail;
    private String role;

    // Getters and setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRetypePassword() { return retypePassword; }
    public void setRetypePassword(String retypePassword) { this.retypePassword = retypePassword; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getParentEmail() { return parentEmail; }
    public void setParentEmail(String parentEmail) { this.parentEmail = parentEmail; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}