package d10_rt01.hocho.controller.child;

import d10_rt01.hocho.dto.LearningProgressDto;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.service.LearningProgressService;
import d10_rt01.hocho.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/child/learning-history")
@CrossOrigin(origins = "*")
public class ChildLearningHistoryController {

    @Autowired
    private LearningProgressService learningProgressService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getOwnLearningHistory(Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userService.findByUsername(username);
            Long childId = user.getId();
            LearningProgressDto learningHistory = learningProgressService.getChildLearningProgress(childId);
            return ResponseEntity.ok(learningHistory);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to get learning history: " + e.getMessage());
        }
    }
} 