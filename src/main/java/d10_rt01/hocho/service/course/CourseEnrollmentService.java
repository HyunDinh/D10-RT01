package d10_rt01.hocho.service.course;

import d10_rt01.hocho.model.Course;
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
    public int countStudentsByCourseId(Long courseId) {
        System.out.println("Checking students for courseId: " + courseId);
        int count = courseEnrollmentRepository.countByCourse_CourseId(courseId);

        // In ra số học sinh tìm được
        System.out.println("Number of students enrolled for courseId " + courseId + ": " + count);

        return count;
    }

    public List<CourseEnrollment> findByCourse(Course course) {
        return courseEnrollmentRepository.findByCourse(course);
    }

}
