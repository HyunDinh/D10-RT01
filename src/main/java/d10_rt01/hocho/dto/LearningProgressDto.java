package d10_rt01.hocho.dto;

import lombok.Data;
import java.util.List;

@Data
public class LearningProgressDto {
    private Long childId;
    private String childName;
    private List<CourseProgressDto> courses;
    private double overallProgress;
    private int totalCourses;
    private int completedCourses;
    private double averageScore;
    private int totalStudyTime; // minutes
} 