package com.d10rt01.hocho.controller.api;

import com.d10rt01.hocho.model.User;
import com.d10rt01.hocho.dto.UserDTO;
import com.d10rt01.hocho.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientApiController {

    private final UserService clientService;

    @Autowired
    public ClientApiController(UserService clientService) {
        this.clientService = clientService;
    }

    @PostMapping
    public ResponseEntity<?> addClient(@RequestBody UserDTO clientDTO) {
        try {
            if (clientDTO.getEmail() == null || clientDTO.getEmail().trim().isEmpty()) {
                throw new IllegalArgumentException("Email là bắt buộc");
            }
            if (clientDTO.getPassword() == null || clientDTO.getPassword().trim().isEmpty()) {
                throw new IllegalArgumentException("Mật khẩu là bắt buộc");
            }
            // Kiểm tra số điện thoại nếu role là parent hoặc teacher
            if ((clientDTO.getRole().equals("parent") || clientDTO.getRole().equals("teacher"))
                    && (clientDTO.getPhoneNumber() == null || clientDTO.getPhoneNumber().trim().isEmpty())) {
                throw new IllegalArgumentException("Số điện thoại là bắt buộc cho phụ huynh và giáo viên");
            }

            // Ánh xạ UserDTO sang User
            User client = new User();
            client.setUsername(clientDTO.getUsername());
            client.setPasswordHash(clientDTO.getPassword()); // Gán password vào passwordHash
            client.setEmail(clientDTO.getEmail());
            client.setPhoneNumber(clientDTO.getPhoneNumber());
            client.setRole(clientDTO.getRole());
            client.setFullName(clientDTO.getFullName());
            client.setDateOfBirth(clientDTO.getDateOfBirth());

            User savedClient = clientService.addUser(client);
            return ResponseEntity.ok(savedClient);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping
    public List<User> getAllClients() {
        return clientService.getAllUsers();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable Integer id) {
        try {
            clientService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    static class ErrorResponse {
        private final String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }
    }
}