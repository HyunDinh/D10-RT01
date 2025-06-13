package com.d10rt01.hocho.service.user;

import com.d10rt01.hocho.config.Configs;
import com.d10rt01.hocho.model.User;
import com.d10rt01.hocho.repository.UserRepository;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
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
        user.setIsActive(true);
        user.setCreatedAt(Instant.now());
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
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

    @Override
    public User updateUserPassword(String username, String oldPassword, String newPassword) {
        User user = findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));

        // Kiểm tra mật khẩu cũ
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Mật khẩu cũ không chính xác");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    public User updateProfilePicture(String username, MultipartFile file) throws IOException {
        User user = findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));

        // Kiểm tra loại file
        String contentType = file.getContentType();
        if (!"image/png".equals(contentType) && !"image/jpeg".equals(contentType)) {
            throw new IllegalArgumentException("Chỉ chấp nhận file PNG hoặc JPG");
        }

        // Xử lý file: scale nếu cần
        byte[] processedFileBytes = processFile(file);

        // Xóa file avatar cũ nếu có
        if (user.getAvatarUrl() != null && !"none".equals(user.getAvatarUrl())) {
            Path oldFilePath = Paths.get(Configs.ABSOLUTE_PATH_PROFILE_UPLOAD_DIR, user.getAvatarUrl());
            Files.deleteIfExists(oldFilePath);
        }

        // Lưu file mới
        String fileName = username + "_" + System.currentTimeMillis() + "." + getFileExtension(file.getOriginalFilename());
        Path uploadPath = Paths.get(Configs.ABSOLUTE_PATH_PROFILE_UPLOAD_DIR, fileName);
        Files.createDirectories(uploadPath.getParent());
        Files.write(uploadPath, processedFileBytes);

        user.setAvatarUrl(fileName);
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    private byte[] processFile(MultipartFile file) throws IOException {
        byte[] fileBytes = file.getBytes();
        long fileSize = fileBytes.length;

        // Nếu file nhỏ hơn giới hạn, không cần scale
        if (fileSize <= Configs.MAX_PROFILE_PICTURE_SIZE) {
            return fileBytes;
        }

        // Scale file để giảm kích thước
        double quality = 0.8; // Chất lượng ban đầu (0.0 - 1.0)
        double scale = 1.0;   // Tỷ lệ resize ban đầu
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        while (fileSize > Configs.MAX_PROFILE_PICTURE_SIZE && quality > 0.1 && scale > 0.1) {
            outputStream.reset(); // Reset stream để ghi lại từ đầu
            Thumbnails.of(new ByteArrayInputStream(fileBytes))
                    .scale(scale) // Resize kích thước ảnh
                    .outputQuality(quality) // Giảm chất lượng ảnh
                    .toOutputStream(outputStream);

            fileBytes = outputStream.toByteArray();
            fileSize = fileBytes.length;

            // Giảm scale hoặc quality nếu vẫn vượt giới hạn
            if (fileSize > Configs.MAX_PROFILE_PICTURE_SIZE) {
                if (scale > 0.1) {
                    scale -= 0.1; // Giảm kích thước ảnh 10%
                } else {
                    quality -= 0.1; // Giảm chất lượng 10%
                    scale = 1.0; // Reset scale nếu đã giảm quality
                }
            }
        }

        // Nếu vẫn không đạt yêu cầu sau khi scale tối đa, throw exception
        if (fileSize > Configs.MAX_PROFILE_PICTURE_SIZE) {
            throw new IllegalArgumentException("Không thể giảm kích thước file xuống dưới 10MB. Vui lòng chọn file nhỏ hơn.");
        }

        return fileBytes;
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return "";
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }
}