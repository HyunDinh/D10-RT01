package org.example.coursemanager;

import org.example.coursemanager.entity.Course;
import org.example.coursemanager.entity.Teacher;
import org.example.coursemanager.repository.TeacherRepositoryImpl;
import org.example.coursemanager.service.TeacherService;
import org.example.coursemanager.service.TeacherServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
public class Main {
    TeacherService teacherService;

    @Autowired
    public Main(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }
}
