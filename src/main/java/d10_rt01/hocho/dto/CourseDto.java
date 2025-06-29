package d10_rt01.hocho.dto;

import d10_rt01.hocho.model.enums.AgeGroup;
import d10_rt01.hocho.model.enums.CourseStatus;
import d10_rt01.hocho.model.enums.Subject;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CourseDto {
    private Long courseId;
    private String title;
    private String description;
    private String courseImageUrl;
    private Long teacherId;
    private String teacherName;
    private AgeGroup ageGroup;
    private BigDecimal price;
    private CourseStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Subject subject;
} 