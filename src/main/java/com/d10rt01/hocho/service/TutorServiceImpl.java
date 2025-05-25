package com.d10rt01.hocho.service;

import com.d10rt01.hocho.entity.Tutor;
import com.d10rt01.hocho.entity.TutorStatus;
import com.d10rt01.hocho.entity.User;
import com.d10rt01.hocho.repository.TutorRepository;
import com.d10rt01.hocho.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TutorServiceImpl implements TutorService {

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public Tutor createOrUpdateTutorProfile(Long userId, Tutor tutorDetails) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        // Check user co role la Teacher khong
        if (!"teacher".equals(user.getRole().toString().toLowerCase())) {
             throw new RuntimeException("User is not a teacher");
        }

        Tutor existingTutor = tutorRepository.findByUser_UserId(userId);

        if (existingTutor == null) {
            //Tao profile
            tutorDetails.setUser(user);
            tutorDetails.setCreatedAt(LocalDateTime.now());
            tutorDetails.setUpdatedAt(LocalDateTime.now());
            //Luu xuong
            return tutorRepository.save(tutorDetails);
        } else {
            // Cap Nhat Profile neu da ton tai
            existingTutor.setSpecialization(tutorDetails.getSpecialization());
            existingTutor.setExperience(tutorDetails.getExperience());
            existingTutor.setEducation(tutorDetails.getEducation());
            existingTutor.setIntroduction(tutorDetails.getIntroduction());
            existingTutor.setUpdatedAt(LocalDateTime.now());
            return tutorRepository.save(existingTutor);
        }
    }

    //Tim gia su dua tren Id
    @Override
    public Tutor getTutorProfileByUserId(Long userId) {
        return tutorRepository.findByUser_UserId(userId);
    }

    //Xoa gia su dua tren Id
    @Override
    @Transactional
    public void deleteTutorProfile(Long userId) {
        Tutor tutor = tutorRepository.findByUser_UserId(userId);
        if (tutor != null) {
            tutorRepository.delete(tutor);
        } else {
            throw new RuntimeException("Tutor profile not found");
        }
    }

    @Override
    public List<Tutor> getAllTutorProfiles() {
        //Lay tat ca cac gia su len
        return tutorRepository.findAll();
    }
    
    @Override
    @Transactional
    public Tutor updateTutorStatus(Long tutorId, TutorStatus newStatus) {
        Optional<Tutor> optionalTutor = tutorRepository.findById(tutorId);
        
        if (optionalTutor.isPresent()) {
            Tutor tutor = optionalTutor.get();
            tutor.setStatus(newStatus);
            tutor.setUpdatedAt(LocalDateTime.now());
            return tutorRepository.save(tutor);
        } else {
            throw new RuntimeException("Tutor profile not found with ID: " + tutorId);
        }
    }
} 