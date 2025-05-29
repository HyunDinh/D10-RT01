package com.d10rt01.hocho.controller.api;

import com.d10rt01.hocho.model.User;
import com.d10rt01.hocho.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.io.IOException;

@RestController
@RequestMapping("/api/hocho")
public class UserApiController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("passwordHash", user.getPasswordHash());
        response.put("email", user.getEmail());
        response.put("phoneNumber", user.getPhoneNumber());
        response.put("avatarUrl", user.getAvatarUrl());
        response.put("fullName", user.getFullName());
        response.put("dateOfBirth", user.getDateOfBirth());
        response.put("role", user.getRole());
        response.put("isActive", user.getIsActive());
        response.put("createdAt", user.getCreatedAt());
        response.put("updatedAt", user.getUpdatedAt());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(Authentication authentication, @RequestBody User updatedUser) {
        String username = authentication.getName();
        User updated = userService.updateUserProfile(username, updatedUser);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/profile/password")
    public ResponseEntity<User> updatePassword(Authentication authentication, @RequestBody Map<String, String> request) {
        String username = authentication.getName();
        String newPassword = request.get("password");
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Mật khẩu mới không được để trống");
        }
        User updated = userService.updateUserPassword(username, newPassword);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/profile/upload")
    public ResponseEntity<User> uploadProfilePicture(Authentication authentication, @RequestParam("file") MultipartFile file, @RequestParam("username") String username) throws IOException {
        User updatedUser = userService.updateProfilePicture(username, file);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/welcome")
    public Map<String, Object> welcome(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại"));
        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("avatarUrl", user.getAvatarUrl()); // Thêm avatarUrl
        return response;
    }

    @GetMapping("/role")
    public Map<String, String> getRole(Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("");
        response.put("role", role);
        return response;
    }

    @GetMapping("/profile/{filename}")
    public ResponseEntity<Resource> getProfileImage(@PathVariable String filename) throws IOException {
        Path filePath = Paths.get("D:/code/intellij_Ultimate/res/static/profile/" + filename);
        Resource resource = new FileSystemResource(filePath);

        if (!resource.exists()) {
            filePath = Paths.get("src/main/resources/static/profile/default.png");
            resource = new FileSystemResource(filePath);
        }

        MediaType mediaType = filename.toLowerCase().endsWith(".png") ? MediaType.IMAGE_PNG : MediaType.IMAGE_JPEG;

        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .header(HttpHeaders.PRAGMA, "no-cache")
                .header(HttpHeaders.EXPIRES, "0")
                .contentType(mediaType)
                .body(resource);
    }

}