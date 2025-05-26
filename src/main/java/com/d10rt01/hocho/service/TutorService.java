package com.d10rt01.hocho.service;

import com.d10rt01.hocho.entity.Tutor;
import com.d10rt01.hocho.entity.TutorStatus;
import java.util.List;

public interface TutorService {
    Tutor createOrUpdateTutorProfile(Long userId, Tutor tutorDetails);
    Tutor getTutorProfileByUserId(Long userId);
    void deleteTutorProfile(Long userId);
    List<Tutor> getAllTutorProfiles();
    Tutor updateTutorStatus(Long tutorId, TutorStatus newStatus);
} 