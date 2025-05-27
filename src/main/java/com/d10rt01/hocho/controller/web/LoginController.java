package com.d10rt01.hocho.controller.web;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("hocho")
public class LoginController {

    @GetMapping("/login")
    public String login() {
        return "loginPage"; // Maps to loginPage.html
    }

    @GetMapping("/welcome")
    public String welcome(Authentication authentication, Model model) {
        String username = authentication.getName();
        model.addAttribute("username", username);
        return "welcomePage"; // Maps to welcomePage.html
    }
}