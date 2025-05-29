package com.d10rt01.hocho.service.user;

import com.d10rt01.hocho.config.AbsoluteConfigPaths;
import com.d10rt01.hocho.model.User;
import com.d10rt01.hocho.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User addUser(User user) {
        if (findByUsername(user.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Tên người dùng đã tồn tại");
        }
        if (user.getUsername() == null || user.getUsername().isEmpty()) {
            throw new IllegalArgumentException("Tên người dùng là bắt buộc");
        }
        if (user.getPasswordHash() == null || user.getPasswordHash().isEmpty()) {
            throw new IllegalArgumentException("Mật khẩu là bắt buộc");
        }
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            throw new IllegalArgumentException("Email là bắt buộc");
        }
        if (user.getRole() == null || user.getRole().isEmpty()) {
            throw new IllegalArgumentException("Vai trò là bắt buộc");
        }
        if (!user.getRole().equals("child") && !user.getRole().equals("parent") && !user.getRole().equals("teacher") && !user.getRole().equals("admin")) {
            throw new IllegalArgumentException("Vai trò phải là CHILD, PARENT, TEACHER hoặc ADMIN");
        }
        if ("child".equals(user.getRole())) {
            user.setPhoneNumber("none");
        } else if (user.getPhoneNumber() == null || user.getPhoneNumber().isEmpty()) {
            throw new IllegalArgumentException("Số điện thoại là bắt buộc");
        }
        user.setAvatarUrl("none");
        user.setIsActive(true); // Đặt mặc định isActive
        user.setCreatedAt(Instant.now()); // Đặt createdAt
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("Tài khoản với ID " + id + " không tồn tại");
        }
        userRepository.deleteById(id);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User updateUserProfile(String username, User updatedUser) {
        User user = findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        user.setFullName(updatedUser.getFullName());
        user.setDateOfBirth(updatedUser.getDateOfBirth());
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    public User updateUserPassword(String username, String newPassword) {
        User user = findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    public User updateProfilePicture(String username, MultipartFile file) throws IOException {
        User user = findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));

        String fileName = username + "_" + System.currentTimeMillis() + "." + getFileExtension(file.getOriginalFilename());
        Path uploadPath = Paths.get(AbsoluteConfigPaths.UPLOAD_DIR, fileName);

        Files.createDirectories(uploadPath.getParent());
        Files.write(uploadPath, file.getBytes());

        user.setAvatarUrl(fileName);
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return "";
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }
}