package d10_rt01.hocho.controller.parent;

import d10_rt01.hocho.model.ParentChildMapping;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.service.user.ParentChildService;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Controller
@RequestMapping("/api/parent-child")
public class ParentChildController {

    private static final Logger logger = LoggerFactory.getLogger(ParentChildController.class);

    @Autowired
    private ParentChildService parentChildService;

    @GetMapping
    public ResponseEntity<List<User>> getChildrenByParentId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.error("Authentication is null or not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();

        // Get the parent ID based on the authenticated user's username
        Long parentId = parentChildService.getParentIdByUsername(username);

        List<User> children = parentChildService.getMappedChildren(parentId);
        if (children.isEmpty()) {
            logger.info("No children found for parent ID: {}", parentId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        System.out.println("************************************************************");
        logger.info("Returning {} children for parent ID: {}", children.size(), parentId);
        return ResponseEntity.ok(children);
    }
}
