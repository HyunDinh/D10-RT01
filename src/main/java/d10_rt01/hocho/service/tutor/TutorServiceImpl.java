package d10_rt01.hocho.service.tutor;

import d10_rt01.hocho.model.User;
import d10_rt01.hocho.repository.TutorRepository;
import d10_rt01.hocho.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import d10_rt01.hocho.model.Tutor;
import d10_rt01.hocho.model.enums.TutorStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TutorServiceImpl implements TutorService {

    @Autowired
    private TutorRepository tutorRepository;

    @Autowired
    private UserRepository userRepository;


    //Tạo hoặc update profile gia sư
    @Override
    @Transactional
    public Tutor createOrUpdateTutorProfile(Long userId, Tutor tutorDetails) {
        //Kiểm tra user có tồn tại không
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        //Check user co role la Teacher khong
        if (!"teacher".equalsIgnoreCase(user.getRole())) {
             throw new RuntimeException("User is not a teacher");
        }

        //Kiểm tra thông tin gia sư đã tồn tại chưa
        Tutor existingTutor = tutorRepository.findByUser_Id(userId);

        //Thông tin gia sư chưa tồn tại
        if (existingTutor == null) {
            //Tao profile
            tutorDetails.setUser(user); //SET Id từ Id giáo viên
            tutorDetails.setCreatedAt(LocalDateTime.now());
            tutorDetails.setUpdatedAt(LocalDateTime.now());
            //Luu xuong
            return tutorRepository.save(tutorDetails);
        }

        // Cap Nhat Profile neu da ton tai
        else {
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
        return tutorRepository.findByUser_Id(userId);
    }

    //Xoa gia su dua tren Id
    @Override
    @Transactional
    public void deleteTutorProfile(Long userId) {
        Tutor tutor = tutorRepository.findByUser_Id(userId);
        if (tutor != null) {
            tutorRepository.delete(tutor);
        } else {
            throw new RuntimeException("Tutor profile not found");
        }
    }

    //Lay tat ca cac gia su len
    @Override
    public List<Tutor> getAllTutorProfiles() {
        return tutorRepository.findAll();
    }

    //Phê duyệt thông tin cho gia sư (Quản trị viên phê duyệt)
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