package d10_rt01.hocho.controller.auth;

import d10_rt01.hocho.config.HochoConfig;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hocho")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
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
    public ResponseEntity<User> updateProfile(Authentication authentication, @RequestBody Map<String, String> request) {
        String username = authentication.getName();
        String fullName = request.get("fullName");
        String dateOfBirth = request.get("dateOfBirth");

        // Optional: Validate input
        if (fullName == null && dateOfBirth == null) {
            throw new IllegalArgumentException("At least one field (fullName or dateOfBirth) must be provided.");
        }
        try {
            // Call UserService to update profile
            User updated = userService.updateUserProfile(username, fullName, dateOfBirth, null); // phoneNumber is null as it's not sent from frontend
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            throw e; // Will be caught by global exception handler
        } catch (Exception e) {
            throw new RuntimeException("Failed to update profile: " + e.getMessage());
        }
    }

    @PutMapping("/profile/password")
    public ResponseEntity<User> updatePassword(Authentication authentication, @RequestBody Map<String, String> request) {
        String username = authentication.getName();
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");

        if (oldPassword == null || oldPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Mật khẩu cũ không được để trống");
        }
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Mật khẩu mới không được để trống");
        }
        if (confirmPassword == null || confirmPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Xác nhận mật khẩu không được để trống");
        }
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Mật khẩu mới và xác nhận mật khẩu không khớp");
        }

        User updated = userService.updateUserPassword(username, oldPassword, newPassword);
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
        User user = userService.findByUsername(username);
        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("avatarUrl", user.getAvatarUrl()); // Thêm avatarUrl
        return response;
    }

    @GetMapping("/role")
    public Map<String, String> getRole(Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        String role = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).findFirst().orElse("");
        response.put("role", role);
        return response;
    }

    @GetMapping("/profile/{filename}")
    public ResponseEntity<Resource> getProfileImage(@PathVariable String filename) throws IOException {
        Path filePath = Paths.get(HochoConfig.ABSOLUTE_PATH_PROFILE_UPLOAD_DIR + filename);
        Resource resource = new FileSystemResource(filePath);

        if (!resource.exists()) {
            filePath = Paths.get(HochoConfig.ABSOLUTE_PATH_PROFILE_UPLOAD_DIR);
            resource = new FileSystemResource(filePath);
        }

        MediaType mediaType = filename.toLowerCase().endsWith(".png") ? MediaType.IMAGE_PNG : MediaType.IMAGE_JPEG;

        return ResponseEntity.ok().header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate").header(HttpHeaders.PRAGMA, "no-cache").header(HttpHeaders.EXPIRES, "0").contentType(mediaType).body(resource);
    }

    @GetMapping("/children")
    public ResponseEntity<List<Map<String, Object>>> getChildrenOfParent(Authentication authentication) {
        String username = authentication.getName();
        User parent = userService.findByUsername(username);
        List<User> children = userService.getChildrenOfParent(parent.getId());
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (User child : children) {
            Map<String, Object> childInfo = new HashMap<>();
            childInfo.put("id", child.getId());
            childInfo.put("username", child.getUsername());
            childInfo.put("fullName", child.getFullName());
            childInfo.put("dateOfBirth", child.getDateOfBirth());
            childInfo.put("avatarUrl", child.getAvatarUrl());
            result.add(childInfo);
        }
        return ResponseEntity.ok(result);
    }

}