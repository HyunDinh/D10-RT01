package d10_rt01.hocho.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "persistent_logins")
public class PersistentLogin {

    // Getters and Setters
    @Column(name = "username", length = 64, nullable = false)
    private String username;

    @Id
    @Column(name = "series", length = 64)
    private String series;

    @Column(name = "token", length = 64, nullable = false)
    private String token;

    @Column(name = "last_used", nullable = false)
    private LocalDateTime lastUsed;

    // Constructors
    public PersistentLogin() {
    }

    public PersistentLogin(String username, String series, String token, LocalDateTime lastUsed) {
        this.username = username;
        this.series = series;
        this.token = token;
        this.lastUsed = lastUsed;
    }

}