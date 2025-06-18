package d10_rt01.hocho.repository;

import d10_rt01.hocho.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    User findByEmail(String email);
    User findByVerificationToken(String token);
    User findByResetPasswordToken(String token);
}