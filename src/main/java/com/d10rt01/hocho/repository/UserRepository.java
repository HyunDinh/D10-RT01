package com.d10rt01.hocho.repository;

import com.d10rt01.hocho.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    List<User> findByRole(String role);
    Optional<User> findById(Long id);
}