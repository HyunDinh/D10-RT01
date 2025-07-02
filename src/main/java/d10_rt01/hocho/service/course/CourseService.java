package d10_rt01.hocho.service.course;

import d10_rt01.hocho.dto.CourseDto;
import d10_rt01.hocho.model.Course;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.model.enums.CourseStatus;
import d10_rt01.hocho.repository.CourseRepository;
import d10_rt01.hocho.repository.UserRepository;
import d10_rt01.hocho.service.NotificationIntegrationService;
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

    @Autowired
    private NotificationIntegrationService notificationIntegrationService;

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
        
        Course savedCourse = courseRepository.save(course);
        
        // Tạo notification cho admin khi teacher thêm course mới
        String teacherName = teacher.getFullName() != null ? teacher.getFullName() : teacher.getUsername();
        notificationIntegrationService.createTeacherAddedCourseNotifications(teacherName, savedCourse.getTitle());
        
        return savedCourse;
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
            existingCourse.setSubject(course.getSubject());
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

    public List<CourseDto> getFilteredCourses(String category, String priceRange, String level, String search) {
        List<Course> courses = courseRepository.findAll();
        return courses.stream()
                .filter(c -> {
                    if (category == null || category.isEmpty()) return true;
                    // Map category từ FE sang enum AgeGroup
                    String expectedAgeGroup = null;
                    switch (category) {
                        case "4-6": expectedAgeGroup = "AGE_4_6"; break;
                        case "7-9": expectedAgeGroup = "AGE_7_9"; break;
                        case "10-12": expectedAgeGroup = "AGE_10_12"; break;
                        case "13-15": expectedAgeGroup = "AGE_13_15"; break;
                        default: return true;
                    }
                    return c.getAgeGroup().toString().equals(expectedAgeGroup);
                })
                .filter(c -> {
                    if (priceRange == null || priceRange.isEmpty()) return true;
                    try {
                        if (priceRange.endsWith("+")) {
                            // Xử lý format "1000000+"
                            double min = Double.parseDouble(priceRange.replace("+", ""));
                            return c.getPrice() != null && c.getPrice().doubleValue() >= min;
                        } else {
                            String[] parts = priceRange.split("-");
                            if (parts.length == 2) {
                                double min = Double.parseDouble(parts[0]);
                                double max = Double.parseDouble(parts[1]);
                                return c.getPrice() != null && c.getPrice().doubleValue() >= min && c.getPrice().doubleValue() <= max;
                            }
                        }
                    } catch (Exception e) { return true; }
                    return true;
                })
                .filter(c -> level == null || level.isEmpty() || c.getSubject() == null || c.getSubject().toString().equalsIgnoreCase(level))
                .filter(c -> search == null || search.isEmpty() || c.getTitle().toLowerCase().contains(search.toLowerCase()))
                .map(this::convertToDto)
                .collect(Collectors.toList());
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
        dto.setSubject(course.getSubject());
        return dto;
    }
}

