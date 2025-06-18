package d10_rt01.hocho.service.tutor;


import d10_rt01.hocho.model.Tutor;
import d10_rt01.hocho.model.enums.TutorStatus;

import java.util.List;

public interface TutorService {
    Tutor createOrUpdateTutorProfile(Long userId, Tutor tutorDetails);
    Tutor getTutorProfileByUserId(Long userId);
    void deleteTutorProfile(Long userId);
    List<Tutor> getAllTutorProfiles();
    Tutor updateTutorStatus(Long tutorId, TutorStatus newStatus);
} 