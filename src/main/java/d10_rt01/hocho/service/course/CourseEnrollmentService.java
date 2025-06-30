package d10_rt01.hocho.service.course;

import d10_rt01.hocho.model.CourseEnrollment;
import d10_rt01.hocho.repository.CourseEnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseEnrollmentService {

    private final CourseEnrollmentRepository courseEnrollmentRepository;

    @Autowired
    public CourseEnrollmentService(CourseEnrollmentRepository courseEnrollmentRepository) {
        this.courseEnrollmentRepository = courseEnrollmentRepository;
    }

    public List<CourseEnrollment> findAll() {
        return courseEnrollmentRepository.findAll();
    }
}
