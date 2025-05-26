package com.d10rt01.hocho.repository;

import com.d10rt01.hocho.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    //Tìm user theo Name
    Optional<User> findByUsername(String username);
} 