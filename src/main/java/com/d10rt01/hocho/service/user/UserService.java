package com.d10rt01.hocho.service.user;


import com.d10rt01.hocho.model.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface UserService {

    List<User> getAllUsers();
    User addUser(User User);
    void deleteUser(Integer id);
    Optional<User> findByUsername(String username);

    User updateUserProfile(String username, User updatedUser);
    User updateUserPassword(String username, String newPassword);
    User updateProfilePicture(String username, MultipartFile file) throws IOException;
}