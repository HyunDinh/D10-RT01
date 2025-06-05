package com.d10rt01.hocho.service;

import com.d10rt01.hocho.model.User;
import com.d10rt01.hocho.model.UserRole;
import com.d10rt01.hocho.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TeacherService {
    private final UserRepository userRepository;

    @Autowired
    public TeacherService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllTeachers() {
        return userRepository.findByRole("TEACHER");
    }

    public Optional<User> findTeacherById(Long id) {
        return userRepository.findById(id);
    }
}
