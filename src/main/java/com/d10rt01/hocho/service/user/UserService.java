package com.d10rt01.hocho.service.user;


import com.d10rt01.hocho.model.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> getAllUsers();
    User addUser(User User);
    void deleteUser(Integer id);
    Optional<User> findByUsername(String username);
}