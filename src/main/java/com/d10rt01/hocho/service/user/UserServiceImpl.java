package com.d10rt01.hocho.service.user;

import com.d10rt01.hocho.model.User;
import com.d10rt01.hocho.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository UserRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository UserRepository) {
        this.UserRepository = UserRepository;
    }

    @Override
    public List<User> getAllUsers() {
        return UserRepository.findAll();
    }

    @Override
    public User addUser(User User) {
        if (User.getUsername() == null || User.getUsername().isEmpty()) {
            throw new IllegalArgumentException("Tên người dùng là bắt buộc");
        }
        if (User.getPasswordHash() == null || User.getPasswordHash().isEmpty()) {
            throw new IllegalArgumentException("Mật khẩu là bắt buộc");
        }
        if (User.getEmail() == null || User.getEmail().isEmpty()) {
            throw new IllegalArgumentException("Email là bắt buộc");
        }
        if (User.getPhoneNumber() == null || User.getPhoneNumber().isEmpty()) {
            throw new IllegalArgumentException("Số điện thoại là bắt buộc");
        }
        if (User.getRole() == null || User.getRole().isEmpty()) {
            throw new IllegalArgumentException("Vai trò là bắt buộc");
        }
        if (!User.getRole().equals("child") && !User.getRole().equals("parent") && !User.getRole().equals("teacher") && !User.getRole().equals("admin")) {
            throw new IllegalArgumentException("Vai trò phải là CUSTOMER, MANAGER hoặc ADMIN");
        }
        if (UserRepository.findByUsername(User.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Tên người dùng đã tồn tại");
        }
        User.setPasswordHash(passwordEncoder.encode(User.getPasswordHash()));
        return UserRepository.save(User);
    }

    @Override
    public void deleteUser(Integer id) {
        if (!UserRepository.existsById(id)) {
            throw new IllegalArgumentException("Tài khoản với ID " + id + " không tồn tại");
        }
        UserRepository.deleteById(id);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return UserRepository.findByUsername(username);
    }
}