# 📊 Tính năng Monitor Child's Learning Progress (Parent)

## 🎯 Mô tả
Tính năng cho phép phụ huynh theo dõi tiến độ học tập của con một cách chi tiết và trực quan, bao gồm:
- Tổng quan tiến độ học tập
- Chi tiết từng khóa học
- Kết quả quiz và bài kiểm tra
- Thời gian học tập
- Thống kê học tập

## 🏗️ Kiến trúc

### Backend (Spring Boot)

#### 1. DTOs
- `LearningProgressDto`: DTO tổng quan tiến độ học tập
- `CourseProgressDto`: DTO tiến độ từng khóa học
- `LessonProgressDto`: DTO tiến độ từng bài học
- `QuizResultDto`: DTO kết quả quiz

#### 2. Service Layer
- `LearningProgressService`: Interface định nghĩa các method
- `LearningProgressServiceImpl`: Implementation logic tính toán tiến độ

#### 3. Controller Layer
- `LearningProgressController`: API endpoints cho learning progress
- `ParentController`: API endpoints cho quản lý con của parent

#### 4. Repository Layer
- `LearningHistoryRepository`: Quản lý lịch sử học tập
- Sử dụng các repository có sẵn: `CourseEnrollmentRepository`, `LessonRepository`, `QuizResultRepository`

### Frontend (React)

#### 1. Pages
- `LearningProgress.jsx`: Trang chính hiển thị tiến độ học tập
- `ParentLearningMonitor.jsx`: Dashboard cho parent

#### 2. Styles
- `LearningProgress.module.css`: CSS cho trang learning progress
- `ParentDashboard.module.css`: CSS cho parent dashboard

## 🚀 API Endpoints

### Learning Progress APIs
```
GET /api/parent/learning-progress/child/{childId}
GET /api/parent/learning-progress/child/{childId}/course/{courseId}
GET /api/parent/learning-progress/child/{childId}/overall-progress
GET /api/parent/learning-progress/child/{childId}/course/{courseId}/progress
```

### Parent Management APIs
```
GET /api/parent/children
GET /api/parent/children/{childId}
```

## 📊 Cách tính toán tiến độ

### 1. Tiến độ tổng thể
```
Overall Progress = (Tổng tiến độ tất cả khóa học) / Số khóa học
```

### 2. Tiến độ khóa học
```
Course Progress = (Số bài học đã hoàn thành / Tổng số bài học) * 100%
```

### 3. Tiến độ bài học
- **NOT_STARTED**: Chưa có learning history
- **IN_PROGRESS**: Có learning history nhưng watch progress < 90%
- **COMPLETED**: Watch progress >= 90%

### 4. Điểm trung bình Quiz
```
Average Quiz Score = (Tổng điểm quiz / Tổng điểm tối đa) * 100%
```

## 🎨 Giao diện

### 1. Parent Dashboard
- Danh sách con của parent
- Quick actions (giỏ hàng, lịch sử thanh toán, giới hạn thời gian)
- Link đến learning progress của từng con

### 2. Learning Progress Page
- **Header**: Tổng quan tiến độ và thống kê
- **Courses Grid**: Danh sách khóa học với progress bar
- **Course Detail**: Chi tiết bài học và quiz khi click vào khóa học

### 3. Responsive Design
- Tối ưu cho desktop, tablet và mobile
- Grid layout tự động điều chỉnh
- Touch-friendly cho mobile

## 🔧 Cài đặt và Chạy

### Backend
1. Đảm bảo database có dữ liệu:
   - `course_enrollments`: Khóa học đã đăng ký
   - `learning_history`: Lịch sử học tập
   - `quiz_results`: Kết quả quiz
   - `lessons`: Bài học

2. Chạy Spring Boot application:
```bash
./mvnw spring-boot:run
```

### Frontend
1. Cài đặt dependencies:
```bash
cd webpage
npm install
```

2. Chạy development server:
```bash
npm run dev
```

3. Truy cập:
```
http://localhost:5173/hocho/parent/dashboard
```

## 🔐 Bảo mật

- Chỉ parent mới có thể xem tiến độ học tập của con mình
- Kiểm tra quyền truy cập thông qua `ParentChildMapping`
- Sử dụng Spring Security để xác thực

## 📈 Tính năng mở rộng

### 1. Thống kê nâng cao
- Biểu đồ tiến độ theo thời gian
- So sánh tiến độ giữa các con
- Báo cáo hàng tuần/tháng

### 2. Thông báo
- Email thông báo khi con hoàn thành khóa học
- Push notification cho tiến độ mới

### 3. Mục tiêu học tập
- Thiết lập mục tiêu cho từng con
- Theo dõi tiến độ đạt mục tiêu

### 4. Xuất báo cáo
- Export PDF báo cáo tiến độ
- Chia sẻ báo cáo với giáo viên

## 🐛 Troubleshooting

### Lỗi thường gặp

1. **Không hiển thị dữ liệu**
   - Kiểm tra `learning_history` có dữ liệu không
   - Kiểm tra `course_enrollments` có đúng child_id không

2. **Lỗi API 400**
   - Kiểm tra authentication
   - Kiểm tra parent-child mapping

3. **Progress bar không chính xác**
   - Kiểm tra logic tính toán trong `LearningProgressServiceImpl`
   - Kiểm tra dữ liệu `watch_progress` trong `learning_history`

## 📝 Ghi chú

- Tính năng sử dụng dữ liệu có sẵn, không tạo thêm entity mới
- Tính toán real-time dựa trên dữ liệu hiện có
- Tối ưu performance với caching nếu cần
- Dễ dàng mở rộng và bảo trì 