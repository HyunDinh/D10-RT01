package d10_rt01.hocho.service.course;

import d10_rt01.hocho.dto.CourseDto;
import d10_rt01.hocho.model.Course;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.model.enums.CourseStatus;
import d10_rt01.hocho.repository.CourseRepository;
import d10_rt01.hocho.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<CourseDto> getAllCoursesAsDto() {
        return courseRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<Course> getCourseByTeacherId(long teacherId) {
        return courseRepository.findCoursesByTeacherId(teacherId);
    }

    public List<CourseDto> getCourseByTeacherIdAsDto(long teacherId) {
        return courseRepository.findCoursesByTeacherId(teacherId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public Course addCourseByTeacherId(Long teacherId, Course course) {
        if (course == null || teacherId == null || teacherId <= 0) {
            throw new IllegalArgumentException("Course and teacher ID must not be null");
        }
        User teacher = userRepository.findById(teacherId)
            .orElseThrow(() -> new IllegalArgumentException("Teacher not found with ID: " + teacherId));

        course.setTeacher(teacher);
        return courseRepository.save(course);
    }

    @Transactional
    public Course editCourse(long id, Course course) {
        if (course != null && courseRepository.existsById(id)) {
            Course existingCourse = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
            existingCourse.setTitle(course.getTitle());
            existingCourse.setDescription(course.getDescription());
            existingCourse.setCourseImageUrl(course.getCourseImageUrl());
            existingCourse.setAgeGroup(course.getAgeGroup());
            existingCourse.setPrice(course.getPrice());
            return courseRepository.save(existingCourse);
        }
        throw new RuntimeException("Course not found");
    }

    public void deleteCourse(long id) {
        if (courseRepository.existsById(id)) {
            courseRepository.deleteById(id);
        } else {
            throw new RuntimeException("Course not found");
        }
    }
    public List<Course> getAllPendingCourse() { // moi them boi LTDat
        CourseStatus status = CourseStatus.PENDING;
        List<Course> courseList = courseRepository.findByStatus(status);
        return courseList;
    }

    public List<CourseDto> getAllPendingCourseAsDto() {
        CourseStatus status = CourseStatus.PENDING;
        List<Course> courseList = courseRepository.findByStatus(status);
        return courseList.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void rejectCourse(Long courseId) { // moi them boi LTDat
        Course course = courseRepository.findById(courseId).orElseThrow(()-> new RuntimeException("Course Not Found"));
        course.setStatus(CourseStatus.REJECTED);
        courseRepository.save(course);
    }

    @Transactional
    public void approveCourse(Long courseId) { // moi them boi LTDat
        Course course = courseRepository.findById(courseId).orElseThrow(()-> new RuntimeException("Course Not Found"));
        course.setStatus(CourseStatus.APPROVED);
        courseRepository.save(course);
    }

    private CourseDto convertToDto(Course course) {
        CourseDto dto = new CourseDto();
        dto.setCourseId(course.getCourseId());
        dto.setTitle(course.getTitle());
        dto.setDescription(course.getDescription());
        dto.setCourseImageUrl(course.getCourseImageUrl());
        dto.setTeacherId(course.getTeacher().getId());
        dto.setTeacherName(course.getTeacher().getFullName());
        dto.setAgeGroup(course.getAgeGroup());
        dto.setPrice(course.getPrice());
        dto.setStatus(course.getStatus());
        dto.setCreatedAt(course.getCreatedAt());
        dto.setUpdatedAt(course.getUpdatedAt());
        return dto;
    }
}

