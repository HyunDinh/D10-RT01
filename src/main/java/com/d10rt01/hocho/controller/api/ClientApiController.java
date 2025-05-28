package com.d10rt01.hocho.controller.api;

import com.d10rt01.hocho.model.User;
import com.d10rt01.hocho.service.user.UserService;
import lombok.Getter;
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
    public ResponseEntity<?> addClient(@RequestBody User client) {
        try {
            if (client.getEmail() == null || client.getEmail().trim().isEmpty()) {
                throw new IllegalArgumentException("Email là bắt buộc");
            }
            // Kiểm tra số điện thoại nếu role là parent hoặc teacher
            if ((client.getRole().equals("parent") || client.getRole().equals("teacher"))
                    && (client.getPhoneNumber() == null || client.getPhoneNumber().trim().isEmpty())) {
                throw new IllegalArgumentException("Số điện thoại là bắt buộc cho phụ huynh và giáo viên");
            }
            // Logic gán "none" cho child đã được xử lý ở UserService
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

    @Getter
    static class ErrorResponse {
        private final String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

    }
}