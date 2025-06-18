package d10_rt01.hocho.controller.tutor;

import d10_rt01.hocho.model.Tutor;
import d10_rt01.hocho.model.enums.TutorStatus;
import d10_rt01.hocho.service.tutor.TutorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tutors")
public class TutorController {

    @Autowired
    private TutorService tutorService;

    //Tao thong tin tutor tu giao vien
    @PostMapping("/profile")
    public ResponseEntity<Tutor> createOrUpdateTutorProfile(@RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        Tutor tutorDetails = new Tutor();
        tutorDetails.setSpecialization((String) body.get("specialization"));
        tutorDetails.setExperience(Integer.valueOf(body.get("experience").toString()));
        tutorDetails.setEducation((String) body.get("education"));
        tutorDetails.setIntroduction((String) body.get("introduction"));
        Tutor createdOrUpdatedTutor = tutorService.createOrUpdateTutorProfile(userId, tutorDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrUpdatedTutor);
    }

    //Tim thong tin gia su dua tren Id
    @GetMapping("/profile/{userId}")
    public ResponseEntity<Tutor> getTutorProfile(@PathVariable Long userId) {
        Tutor tutor = tutorService.getTutorProfileByUserId(userId);
        if (tutor != null) {
            return ResponseEntity.ok(tutor);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    //Xoa thong tin gia su dua tren Id
    @DeleteMapping("/profile/{userId}")
    public ResponseEntity<Void> deleteTutorProfile(@PathVariable Long userId) {
        tutorService.deleteTutorProfile(userId);
        return ResponseEntity.noContent().build();
    }

    //Hien thi tat ca cac gia su
    @GetMapping
    public ResponseEntity<List<Tutor>> getAllTutorProfiles() {
        List<Tutor> tutors = tutorService.getAllTutorProfiles();
        return ResponseEntity.ok(tutors);
    }
    
    //Phe duyet gia su (chinh sua trang thai)
    @PutMapping("/{tutorId}/status")
    public ResponseEntity<Tutor> updateTutorStatus(@PathVariable Long tutorId, @RequestParam TutorStatus status) {
        Tutor updatedTutor = tutorService.updateTutorStatus(tutorId, status);
        return ResponseEntity.ok(updatedTutor);
    }
} 