// File: src/main/java/org/example/coursemanager/controller/CourseController.java
package d10_rt01.hocho.controller.course;

import d10_rt01.hocho.config.HochoConfig;
import d10_rt01.hocho.dto.CourseDto;
import d10_rt01.hocho.model.Course;
import d10_rt01.hocho.repository.CourseRepository;
import d10_rt01.hocho.service.course.CourseService;
import d10_rt01.hocho.service.course.TeacherService;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private final TeacherService teacherService;
    private final CourseService courseService;
    private final CourseRepository courseRepository;

    @Autowired
    public CourseController(TeacherService teacherService,
                            CourseService courseService,
                            CourseRepository courseRepository) {
        this.teacherService = teacherService;
        this.courseService = courseService;
        this.courseRepository = courseRepository;
    }

    // Retrieves all courses publicly
    @GetMapping
    public ResponseEntity<List<CourseDto>> getAllCourses(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String priceRange,
        @RequestParam(required = false) String level,
        @RequestParam(required = false) String search
    ) {
        List<CourseDto> courses = courseService.getFilteredCourses(category, priceRange, level, search);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/by-age")
    public ResponseEntity<List<CourseDto>> getCoursesByUserAge(@RequestParam int age) {
        // Convert numeric age to AgeGroup using custom logic
        String ageGroup = convertAgeToAgeGroup(age);
        List<Course> courses = courseRepository.findByAgeGroup(ageGroup);
        List<CourseDto> courseDtos = courses.stream()
                .map(course -> {
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
                })
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(courseDtos);
    }

    private String convertAgeToAgeGroup(int age) {
        // Define age thresholds as needed
        if (age >= 4 && age <= 6) {
            return "AGE_4_6";
        } else if (age >= 7 && age <= 9) {
            return "AGE_7_9";
        } else if (age >= 10 && age <= 12) {
            return "AGE_10_12";
        } else {
            return "AGE_13_15";
        }
    }

    @PostMapping("/{id}/approve") // moi them boi LTD
    public ResponseEntity<?> approveCourse(@PathVariable Long id) {
        courseService.approveCourse(id);
        return ResponseEntity.ok().build();

    }

    @PostMapping("/{id}/reject") // moi them boi LTD
    public ResponseEntity<?> rejectCourse(@PathVariable Long id) {
        courseService.rejectCourse(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/pending") // moi them boi LTD
    public ResponseEntity<List<CourseDto>>getPendingCourse() {
        List<CourseDto> pendingCourses = courseService.getAllPendingCourseAsDto();
        return ResponseEntity.ok(pendingCourses);
    }

    // Upload ảnh cho course
    @PostMapping("/upload-image")
    public Map<String, String> uploadCourseImage(@RequestParam("imageFile") MultipartFile imageFile) {
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = saveCourseImage(imageFile);
        }
        return Map.of("imageUrl", imageUrl);
    }

    // Serve course image
    @GetMapping("/image/{fileName}")
    public ResponseEntity<Resource> getCourseImage(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(HochoConfig.ABSOLUTE_PATH_COURSE_UPLOAD_DIR, fileName);
            Resource resource = new org.springframework.core.io.FileSystemResource(filePath.toFile());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    private String saveCourseImage(MultipartFile file) {
        try {
            String uploadDir = HochoConfig.ABSOLUTE_PATH_COURSE_UPLOAD_DIR;
            System.out.println("[LOG] Bắt đầu lưu file ảnh course...");
            
            // Xử lý và nén ảnh
            byte[] processedFileBytes = processImageFile(file);
            
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir);
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, processedFileBytes);
            
            String imageUrl = "/course/" + fileName;
            System.out.println("[LOG] Đã lưu file course thành công: " + imageUrl);
            
            return imageUrl;
        } catch (IOException e) {
            System.out.println("[LOG] Lỗi khi lưu file course: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi lưu file ảnh course", e);
        }
    }

    private byte[] processImageFile(MultipartFile file) throws IOException {
        byte[] fileBytes = file.getBytes();
        long fileSize = fileBytes.length;

        // Kiểm tra loại file
        String contentType = file.getContentType();
        if (!"image/png".equals(contentType) && !"image/jpeg".equals(contentType)) {
            throw new IllegalArgumentException("Chỉ chấp nhận file PNG hoặc JPG");
        }

        // Nếu file nhỏ hơn giới hạn, không cần scale
        if (fileSize <= HochoConfig.MAX_COURSE_IMAGE_SIZE) {
            return fileBytes;
        }

        // Scale file để giảm kích thước
        double quality = 0.8;
        double scale = 1.0;
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        while (fileSize > HochoConfig.MAX_COURSE_IMAGE_SIZE && quality > 0.1 && scale > 0.1) {
            outputStream.reset();
            Thumbnails.of(new ByteArrayInputStream(fileBytes))
                    .scale(scale)
                    .outputQuality(quality)
                    .toOutputStream(outputStream);

            fileBytes = outputStream.toByteArray();
            fileSize = fileBytes.length;

            if (fileSize > HochoConfig.MAX_COURSE_IMAGE_SIZE) {
                if (scale > 0.1) {
                    scale -= 0.1;
                } else {
                    quality -= 0.1;
                    scale = 1.0;
                }
            }
        }

        return fileBytes;
    }
}