package com.d10rt01.hocho.controller.video;

import com.d10rt01.hocho.model.Video;
import com.d10rt01.hocho.model.ContentStatus;
import com.d10rt01.hocho.model.AgeGroup;
import com.d10rt01.hocho.service.video.VideoService;
import com.d10rt01.hocho.service.user.UserService;
import com.d10rt01.hocho.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/videos")
public class VideoController {
    @Autowired
    private VideoService videoService;

    @Autowired
    private UserService userService;

    private Long getUserIdFromAuthentication(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    // API cho giáo viên
    @PostMapping("/teacher")
    public ResponseEntity<Video> addVideo(
            Authentication authentication,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("ageGroup") AgeGroup ageGroup) throws IOException {
        Long teacherId = getUserIdFromAuthentication(authentication);
        Video video = new Video();
        video.setTitle(title);
        video.setDescription(description);
        video.setAgeGroup(ageGroup);
        return ResponseEntity.ok(videoService.addVideo(teacherId, video, file));
    }

    @GetMapping("/teacher")
    public ResponseEntity<List<Video>> getTeacherVideos(Authentication authentication) {
        Long teacherId = getUserIdFromAuthentication(authentication);
        return ResponseEntity.ok(videoService.getVideosByTeacher(teacherId));
    }

    @PutMapping("/teacher/{videoId}")
    public ResponseEntity<Video> updateVideo(
            @PathVariable Long videoId,
            Authentication authentication,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("ageGroup") AgeGroup ageGroup) throws IOException {
        Long teacherId = getUserIdFromAuthentication(authentication);
        Video video = new Video();
        video.setTitle(title);
        video.setDescription(description);
        video.setAgeGroup(ageGroup);
        return ResponseEntity.ok(videoService.updateVideo(videoId, teacherId, video, file));
    }

    @DeleteMapping("/teacher/{videoId}")
    public ResponseEntity<Void> deleteVideo(
            @PathVariable Long videoId,
            Authentication authentication) {
        Long teacherId = getUserIdFromAuthentication(authentication);
        videoService.deleteVideo(videoId, teacherId);
        return ResponseEntity.ok().build();
    }

    // API cho admin
    @GetMapping("/admin/status/{status}")
    public ResponseEntity<List<Video>> getVideosByStatus(@PathVariable ContentStatus status) {
        return ResponseEntity.ok(videoService.getVideosByStatus(status));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<Video>> getAllVideosForAdmin() {
        return ResponseEntity.ok(videoService.getAllVideos());
    }

    @PutMapping("/admin/{videoId}/status")
    public ResponseEntity<Video> updateVideoStatus(
            @PathVariable Long videoId,
            @RequestParam("status") ContentStatus status) {
        return ResponseEntity.ok(videoService.updateVideoStatus(videoId, status));
    }

    // API cho học sinh
    @GetMapping("/student/age-group/{ageGroup}")
    public ResponseEntity<List<Video>> getApprovedVideosByAgeGroup(@PathVariable AgeGroup ageGroup) {
        return ResponseEntity.ok(videoService.getApprovedVideosByAgeGroup(ageGroup));
    }

    @GetMapping("/student/search")
    public ResponseEntity<List<Video>> searchApprovedVideos(@RequestParam("title") String title) {
        return ResponseEntity.ok(videoService.searchApprovedVideos(title));
    }

    @GetMapping("/student/all-approved")
    public ResponseEntity<List<Video>> getAllApprovedVideos() {
        return ResponseEntity.ok(videoService.getAllApprovedVideos());
    }

    @GetMapping("/{videoId}")
    public ResponseEntity<Video> getVideoById(@PathVariable Long videoId) {
        return ResponseEntity.ok(videoService.getVideoById(videoId));
    }
} 