package d10_rt01.hocho.controller.parent;

import d10_rt01.hocho.dto.SubtractTimeRequest;
import d10_rt01.hocho.model.TimeRestriction;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.service.monitoring.TimeRestrictionService;
import d10_rt01.hocho.service.user.ParentChildService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/api/time-restriction")
public class TimeRestrictionController {

    @Autowired
    private TimeRestrictionService timeRestrictionService;

    @Autowired
    private ParentChildService parentChildService;

//    @GetMapping("/reset")
//    public ResponseEntity<?> resetTimeRestriction(@RequestParam Long childId) {
//        timeRestrictionService.resetTimeRestriction(childId);
//        return ResponseEntity.ok("Time restriction reset successfully for child ID: " + childId);
//    }

    @PostMapping("/set")
    public ResponseEntity<TimeRestriction> setTimeRestriction(
            @RequestParam Long childId,
            @RequestParam(required = false) Integer maxPlayTime,
            @RequestParam(required = false) Integer maxVideoTime) {

        TimeRestriction timeRestriction = timeRestrictionService.addTimeRestriction(childId, maxPlayTime, maxVideoTime);
        return ResponseEntity.ok(timeRestriction);
    }

    @GetMapping("/get")
    public ResponseEntity<List<TimeRestriction>> getTimeRestriction(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        String username = authentication.getName();
        Long parentId = parentChildService.getParentIdByUsername(username);

        List<TimeRestriction> restrictions = timeRestrictionService.getTimeRestriction(parentId);
        return ResponseEntity.ok(restrictions);
    }

    @PostMapping("/reset")
    public ResponseEntity<Void> resetTimeRestriction(@RequestParam Long childId) {
        Optional<TimeRestriction> restriction = timeRestrictionService.getTimeRestrictionByChildId(childId);
        if (restriction.isPresent()) {
            timeRestrictionService.resetTimeRestriction(childId);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/subtract")
    public ResponseEntity<Optional<TimeRestriction>> subtractTime(Authentication authentication, @RequestBody SubtractTimeRequest request) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        String username = authentication.getName();
        Long childId = parentChildService.getChildIdByUsername(username);

        Optional<TimeRestriction> updatedRestriction = timeRestrictionService.subtractVideoTime(childId, request.getTimeSpent());
        return ResponseEntity.ok(updatedRestriction);
    }

    @GetMapping("/get/by-child")
    public ResponseEntity<Optional<TimeRestriction>> getTimeRestrictionByChild(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String username = authentication.getName();
        Long childId = parentChildService.getChildIdByUsername(username);
        Optional<TimeRestriction> restriction = timeRestrictionService.getTimeRestrictionByChildId(childId);
        return ResponseEntity.ok(restriction);
    }

////    @GetMapping("/check/play")
//    public ResponseEntity<Boolean> isPlayTimeExceeded(
//            @RequestParam Long childId,
//            @RequestParam Integer usedPlayTime) {
//
//        boolean isExceeded = timeRestrictionService.isPlayTimeExceeded(childId, usedPlayTime);
//        return ResponseEntity.ok(isExceeded);
//    }

//    @GetMapping("/check/video")
//    public ResponseEntity<Boolean> isVideoTimeExceeded(
//            @RequestParam Long childId,
//            @RequestParam Integer usedVideoTime) {
//
//        boolean isExceeded = timeRestrictionService.isStudyTimeExceeded(childId, usedVideoTime);
//        return ResponseEntity.ok(isExceeded);
//    }


}
