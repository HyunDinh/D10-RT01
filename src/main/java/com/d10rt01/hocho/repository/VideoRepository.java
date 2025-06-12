package com.d10rt01.hocho.repository;

import com.d10rt01.hocho.model.Video;
import com.d10rt01.hocho.model.ContentStatus;
import com.d10rt01.hocho.model.AgeGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
    // Lấy danh sách video theo người tạo (cho giáo viên)
    List<Video> findByCreatedById(Long userId);

    // Lấy danh sách video theo trạng thái (cho admin)
    List<Video> findByStatus(ContentStatus status);

    // Lấy danh sách video đã duyệt theo nhóm tuổi (cho học sinh)
    List<Video> findByStatusAndAgeGroup(ContentStatus status, AgeGroup ageGroup);

    // Tìm kiếm video theo tiêu đề (cho học sinh)
    List<Video> findByStatusAndTitleContaining(ContentStatus status, String title);
} 