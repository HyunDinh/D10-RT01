package d10_rt01.hocho.service.course;

import d10_rt01.hocho.model.User;
import d10_rt01.hocho.model.enums.UserRole;
import d10_rt01.hocho.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TeacherService {
    private final UserRepository userRepository;

    @Autowired
    public TeacherService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllTeachers() {
        return userRepository.findByRole(UserRole.TEACHER.toString());
    }

    public Optional<User> findTeacherById(Long id) {
        return userRepository.findById(id)
            .filter(user -> UserRole.TEACHER.toString().equalsIgnoreCase(user.getRole()));
    }

    public Optional<User> findTeacherByUsername(String username) {
        return userRepository.findByUsername(username)
            .filter(user -> UserRole.TEACHER.toString().equalsIgnoreCase(user.getRole()));
    }
}
