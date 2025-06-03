package org.example.coursemanager.service;

import org.example.coursemanager.entity.User;
import org.example.coursemanager.entity.UserRole;
import org.example.coursemanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeacherService {
    private final UserRepository userRepository;

    @Autowired
    public TeacherService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllTeachers() {
        return userRepository.findByRole(UserRole.TEACHER);
    }

    public User findTeacherById(Long id) {
        return userRepository.findById(id)
            .filter(user -> UserRole.TEACHER.equals(user.getRole()))
            .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + id));
    }
}
