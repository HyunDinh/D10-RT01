package vn.spring.censormanagement.service;

import vn.spring.censormanagement.entity.Course;
import vn.spring.censormanagement.entity.CourseStatus;

import java.util.List;

public interface CourseService {


    List<Course> getAllPendingCourse();

    void rejectCourse(Long courseId);

    void approveCourse(Long courseId);

    List<Course> getAllCourse();

}