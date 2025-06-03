package org.example.coursemanager.repository;

import org.example.coursemanager.entity.Course;
import org.example.coursemanager.entity.User;
import org.example.coursemanager.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByRole(UserRole role);
}
