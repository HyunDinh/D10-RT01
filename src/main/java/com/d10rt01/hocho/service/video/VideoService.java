package com.d10rt01.hocho.service.video;

import com.d10rt01.hocho.model.Video;
import com.d10rt01.hocho.model.ContentStatus;
import com.d10rt01.hocho.model.AgeGroup;
import com.d10rt01.hocho.repository.VideoRepository;
import com.d10rt01.hocho.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class VideoService {
    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private UserRepository userRepository;

    // Thêm video mới (cho giáo viên)
    @Transactional
    public Video addVideo(Long teacherId, Video video, MultipartFile file) throws IOException {
        video.setCreatedBy(userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found")));
        video.setContentData(file.getBytes());
        return videoRepository.save(video);
    }

    // Lấy danh sách video của giáo viên
    public List<Video> getVideosByTeacher(Long teacherId) {
        return videoRepository.findByCreatedById(teacherId);
    }

    // Lấy danh sách video theo trạng thái (cho admin)
    public List<Video> getVideosByStatus(ContentStatus status) {
        return videoRepository.findByStatus(status);
    }

    // Cập nhật trạng thái video (cho admin)
    @Transactional
    public Video updateVideoStatus(Long videoId, ContentStatus status) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));
        video.setStatus(status);
        return videoRepository.save(video);
    }

    // Lấy danh sách video đã duyệt theo nhóm tuổi (cho học sinh)
    public List<Video> getApprovedVideosByAgeGroup(AgeGroup ageGroup) {
        return videoRepository.findByStatusAndAgeGroup(ContentStatus.APPROVED, ageGroup);
    }

    // Tìm kiếm video theo tiêu đề (cho học sinh)
    public List<Video> searchApprovedVideos(String title) {
        return videoRepository.findByStatusAndTitleContaining(ContentStatus.APPROVED, title);
    }

    public List<Video> getAllApprovedVideos() {
        return videoRepository.findByStatus(ContentStatus.APPROVED);
    }

    // Cập nhật thông tin video (cho giáo viên)
    @Transactional
    public Video updateVideo(Long videoId, Long teacherId, Video video, MultipartFile file) throws IOException {
        Video existingVideo = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));
        
        if (!existingVideo.getCreatedBy().getId().equals(teacherId)) {
            throw new SecurityException("Unauthorized to update this video");
        }

        existingVideo.setTitle(video.getTitle());
        existingVideo.setDescription(video.getDescription());
        existingVideo.setAgeGroup(video.getAgeGroup());
        
        if (file != null) {
            existingVideo.setContentData(file.getBytes());
        }
        
        return videoRepository.save(existingVideo);
    }

    // Xóa video (cho giáo viên)
    @Transactional
    public void deleteVideo(Long videoId, Long teacherId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));
        
        if (!video.getCreatedBy().getId().equals(teacherId)) {
            throw new SecurityException("Unauthorized to delete this video");
        }

        videoRepository.deleteById(videoId);
    }

    // Lấy video theo ID
    public Video getVideoById(Long videoId) {
        return videoRepository.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));
    }

    // Lấy tất cả video
    public List<Video> getAllVideos() {
        return videoRepository.findAll();
    }
} 