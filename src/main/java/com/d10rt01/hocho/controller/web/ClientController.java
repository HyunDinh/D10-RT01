package com.d10rt01.hocho.controller.web;

import com.d10rt01.hocho.model.User;
import com.d10rt01.hocho.service.user.UserService;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("hocho")
public class ClientController {

    private final UserService userService;

    @Autowired
    public ClientController(UserService clientService) {
        this.userService = clientService;
    }

    @GetMapping("/clients")
    public String getAllClients(Model model) {
        List<User> clients = userService.getAllUsers();
        model.addAttribute("clients", clients);
        return "clientsPage"; // Maps to clientsPage.html
    }

}
