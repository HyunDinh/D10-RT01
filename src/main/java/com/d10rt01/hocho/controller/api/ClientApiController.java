package com.d10rt01.hocho.controller.api;


import com.d10rt01.hocho.model.User;
import com.d10rt01.hocho.service.user.UserService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clients")
class ClientApiController {

    private final UserService clientService;

    @Autowired
    public ClientApiController(UserService clientService) {
        this.clientService = clientService;
    }

    @PostMapping
    public ResponseEntity<?> addClient(@RequestBody User client) {
        try {
            User savedClient = clientService.addUser(client);
            return ResponseEntity.ok(savedClient);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
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

    // Lớp hỗ trợ trả về lỗi
    @Setter
    @Getter
    static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

    }
}