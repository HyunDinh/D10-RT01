-- CREATE DATABASE
CREATE DATABASE hocho;

-- change role from master to hocho

-- Bảng users: Lưu thông tin tài khoản người dùng
-- Chức năng: 
-- 1. Quản lý thông tin người dùng (trẻ em, phụ huynh, giáo viên, admin)
-- 2. Xác thực và phân quyền người dùng
-- 3. Theo dõi trạng thái hoạt động của tài khoản
CREATE TABLE users (
    user_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh duy nhất cho mỗi người dùng
    username VARCHAR(50) UNIQUE NOT NULL, -- Tên đăng nhập, dùng để xác thực
    password_hash VARCHAR(255) NOT NULL, -- Mật khẩu đã được mã hóa
    email VARCHAR(100) UNIQUE , -- Email liên hệ và khôi phục tài khoản
    phone_number VARCHAR(15) UNIQUE, -- Số điện thoại liên hệ
    full_name NVARCHAR(100), -- Họ tên đầy đủ của người dùng
    date_of_birth DATE, -- Ngày sinh, dùng để xác định độ tuổi
    role VARCHAR(20) NOT NULL CHECK (role IN ('child', 'parent', 'teacher', 'admin')), -- Vai trò người dùng trong hệ thống
    is_active BIT DEFAULT 1, -- Trạng thái hoạt động của tài khoản
    created_at DATETIME DEFAULT GETDATE(), -- Thời gian tạo tài khoản
    updated_at DATETIME, -- Thời gian cập nhật thông tin gần nhất
);

-- Bảng parent_child_mapping: Quản lý mối quan hệ giữa phụ huynh và trẻ em
-- Chức năng:
-- 1. Liên kết tài khoản phụ huynh với tài khoản trẻ em
-- 2. Cho phép một phụ huynh quản lý nhiều trẻ em
-- 3. Cho phép một trẻ em có nhiều phụ huynh quản lý
CREATE TABLE parent_child_mapping (
    mapping_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi liên kết
    parent_id INT NOT NULL, -- ID của phụ huynh
    child_id INT NOT NULL, -- ID của trẻ em
    FOREIGN KEY (parent_id) REFERENCES users(user_id), -- Đảm bảo parent_id tồn tại trong bảng users
    FOREIGN KEY (child_id) REFERENCES users(user_id) -- Đảm bảo child_id tồn tại trong bảng users
);

-- Bảng courses: Quản lý khóa học
-- Chức năng:
-- 1. Lưu trữ thông tin khóa học
-- 2. Phân loại khóa học theo độ tuổi
-- 3. Quản lý trạng thái duyệt khóa học
-- 4. Theo dõi giáo viên tạo khóa học
CREATE TABLE courses (
    course_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi khóa học
    title NVARCHAR(200) NOT NULL, -- Tên khóa học
    description NVARCHAR(1000), -- Mô tả chi tiết về khóa học
    teacher_id INT NOT NULL, -- ID giáo viên tạo khóa học
    age_group VARCHAR(10) NOT NULL CHECK (age_group IN ('4-6', '7-9', '10-12', '13-15')), -- Nhóm tuổi phù hợp
    price DECIMAL(10,2) DEFAULT 0.00, -- Giá khóa học
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')), -- Trạng thái duyệt
    created_at DATETIME DEFAULT GETDATE(), -- Thời gian tạo khóa học
    updated_at DATETIME, -- Thời gian cập nhật gần nhất
    FOREIGN KEY (teacher_id) REFERENCES users(user_id) -- Đảm bảo teacher_id tồn tại trong bảng users
);

-- Bảng course_enrollments: Quản lý đăng ký khóa học
-- Chức năng:
-- 1. Theo dõi việc đăng ký khóa học của học sinh
-- 2. Ghi nhận sự đồng ý của phụ huynh
-- 3. Theo dõi tiến độ học tập
CREATE TABLE course_enrollments (
    enrollment_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi lần đăng ký
    course_id INT NOT NULL, -- ID khóa học được đăng ký
    child_id INT NOT NULL, -- ID học sinh đăng ký
    parent_id INT NOT NULL, -- ID phụ huynh đồng ý
    enrolled_at DATETIME DEFAULT GETDATE(), -- Thời gian đăng ký
    started_at DATETIME, -- Thời gian bắt đầu học
    completed_at DATETIME, -- Thời gian hoàn thành
    FOREIGN KEY (course_id) REFERENCES courses(course_id), -- Đảm bảo course_id tồn tại
    FOREIGN KEY (child_id) REFERENCES users(user_id), -- Đảm bảo child_id tồn tại
    FOREIGN KEY (parent_id) REFERENCES users(user_id) -- Đảm bảo parent_id tồn tại
);

-- Bảng lessons: Quản lý bài học trong khóa học
-- Chức năng:
-- 1. Tổ chức nội dung khóa học thành các bài học
-- 2. Quản lý thứ tự và thời lượng bài học
CREATE TABLE lessons (
    lesson_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi bài học
    course_id INT NOT NULL, -- ID khóa học chứa bài học
    title NVARCHAR(200) NOT NULL, -- Tên bài học
    duration INT, -- Thời lượng bài học (phút)
    created_at DATETIME DEFAULT GETDATE(), -- Thời gian tạo bài học
    updated_at DATETIME, -- Thời gian cập nhật gần nhất
    FOREIGN KEY (course_id) REFERENCES courses(course_id) -- Đảm bảo course_id tồn tại
);

-- Bảng lesson_contents: Quản lý nội dung bài học
-- Chức năng:
-- 1. Lưu trữ các loại nội dung khác nhau của bài học
-- 2. Hỗ trợ đa dạng định dạng (video, pdf, tương tác)
CREATE TABLE lesson_contents (
    content_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi nội dung
    lesson_id INT NOT NULL, -- ID bài học chứa nội dung
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('video', 'pdf', 'interactive')), -- Loại nội dung
    content_url VARCHAR(255) NOT NULL, -- URL truy cập nội dung
    created_at DATETIME DEFAULT GETDATE(), -- Thời gian tạo nội dung
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) -- Đảm bảo lesson_id tồn tại
);

-- Bảng quizzes: Quản lý bài kiểm tra của khóa học
-- Chức năng:
-- 1. Tạo bài kiểm tra cho khóa học
-- 2. Hỗ trợ nhiều loại câu hỏi
CREATE TABLE quizzes (
    quiz_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi bài kiểm tra
    course_id INT NOT NULL, -- ID khóa học chứa bài kiểm tra
    title NVARCHAR(200) NOT NULL, -- Tên bài kiểm tra
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('multiple_choice', 'interactive')), -- Loại câu hỏi
    content NVARCHAR(1000), -- Nội dung câu hỏi
    correct_answer NVARCHAR(500), -- Đáp án đúng
    created_at DATETIME DEFAULT GETDATE(), -- Thời gian tạo bài kiểm tra
    FOREIGN KEY (course_id) REFERENCES courses(course_id) -- Đảm bảo course_id tồn tại
);

-- Bảng quiz_results: Lưu kết quả bài kiểm tra
-- Chức năng:
-- 1. Lưu kết quả làm bài của học sinh
-- 2. Theo dõi tiến độ học tập
CREATE TABLE quiz_results (
    result_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi kết quả
    quiz_id INT NOT NULL, -- ID bài kiểm tra
    child_id INT NOT NULL, -- ID học sinh làm bài
    score DECIMAL(5,2), -- Điểm số
    submitted_at DATETIME DEFAULT GETDATE(), -- Thời gian nộp bài
    FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id), -- Đảm bảo quiz_id tồn tại
    FOREIGN KEY (child_id) REFERENCES users(user_id) -- Đảm bảo child_id tồn tại
);

-- Bảng games: Quản lý trò chơi giáo dục
-- Chức năng:
-- 1. Thêm và quản lý trò chơi giáo dục
-- 2. Phân loại theo độ tuổi
-- 3. Kiểm duyệt nội dung
CREATE TABLE games (
    game_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi trò chơi
    title NVARCHAR(200) NOT NULL, -- Tên trò chơi
    description NVARCHAR(1000), -- Mô tả trò chơi
    age_group VARCHAR(10) NOT NULL CHECK (age_group IN ('4-6', '7-9', '10-12', '13-15')), -- Nhóm tuổi phù hợp
    category VARCHAR(50), -- Phân loại trò chơi
    game_url VARCHAR(255), -- URL truy cập trò chơi
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')), -- Trạng thái duyệt
    created_by INT NOT NULL, -- ID người tạo trò chơi
    created_at DATETIME DEFAULT GETDATE(), -- Thời gian tạo
    updated_at DATETIME, -- Thời gian cập nhật gần nhất
    FOREIGN KEY (created_by) REFERENCES users(user_id) -- Đảm bảo created_by tồn tại
);

-- Bảng videos: Quản lý video giải trí
-- Chức năng:
-- 1. Thêm và quản lý video giải trí
-- 2. Phân loại theo độ tuổi
-- 3. Kiểm duyệt nội dung
CREATE TABLE videos (
    video_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi video
    title NVARCHAR(200) NOT NULL, -- Tên video
    description NVARCHAR(1000), -- Mô tả video
    age_group VARCHAR(10) NOT NULL CHECK (age_group IN ('4-6', '7-9', '10-12', '13-15')), -- Nhóm tuổi phù hợp
    video_url VARCHAR(255), -- URL video
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')), -- Trạng thái duyệt
    created_by INT NOT NULL, -- ID người tạo video
    created_at DATETIME DEFAULT GETDATE(), -- Thời gian tạo
    updated_at DATETIME, -- Thời gian cập nhật gần nhất
    FOREIGN KEY (created_by) REFERENCES users(user_id) -- Đảm bảo created_by tồn tại
);

-- Bảng time_restrictions: Quản lý thời gian sử dụng
-- Chức năng:
-- 1. Giới hạn thời gian học và chơi
-- 2. Cho phép phụ huynh kiểm soát thời gian sử dụng
CREATE TABLE time_restrictions (
    restriction_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi giới hạn
    child_id INT NOT NULL, -- ID học sinh
    parent_id INT NOT NULL, -- ID phụ huynh đặt giới hạn
    max_study_time INT, -- Thời gian học tối đa (phút)
    max_play_time INT, -- Thời gian chơi tối đa (phút)
    created_at DATETIME DEFAULT GETDATE(), -- Thời gian tạo giới hạn
    updated_at DATETIME, -- Thời gian cập nhật gần nhất
    FOREIGN KEY (child_id) REFERENCES users(user_id), -- Đảm bảo child_id tồn tại
    FOREIGN KEY (parent_id) REFERENCES users(user_id) -- Đảm bảo parent_id tồn tại
);

-- Bảng messages: Quản lý tin nhắn
-- Chức năng:
-- 1. Lưu trữ tin nhắn giữa người dùng
-- 2. Hỗ trợ gửi file và hình ảnh
CREATE TABLE messages (
    message_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi tin nhắn
    sender_id INT NOT NULL, -- ID người gửi
    receiver_id INT NOT NULL, -- ID người nhận
    content NVARCHAR(MAX) NOT NULL, -- Nội dung tin nhắn
    message_type VARCHAR(20) CHECK (message_type IN ('text', 'image', 'file')), -- Loại tin nhắn
    is_read BIT DEFAULT 0, -- Trạng thái đã đọc
    created_at DATETIME DEFAULT GETDATE(), -- Thời gian gửi
    FOREIGN KEY (sender_id) REFERENCES users(user_id), -- Đảm bảo sender_id tồn tại
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) -- Đảm bảo receiver_id tồn tại
);

-- Bảng chat_sessions: Quản lý phiên chat
-- Chức năng:
-- 1. Theo dõi các cuộc trò chuyện
-- 2. Quản lý thời gian tin nhắn cuối cùng
CREATE TABLE chat_sessions (
    session_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi phiên chat
    user1_id INT NOT NULL, -- ID người dùng thứ nhất
    user2_id INT NOT NULL, -- ID người dùng thứ hai
    created_at DATETIME DEFAULT GETDATE(), -- Thời gian tạo phiên chat
    last_message_at DATETIME, -- Thời gian tin nhắn cuối cùng
    FOREIGN KEY (user1_id) REFERENCES users(user_id), -- Đảm bảo user1_id tồn tại
    FOREIGN KEY (user2_id) REFERENCES users(user_id) -- Đảm bảo user2_id tồn tại
);

-- Bảng message_attachments: Quản lý file đính kèm
-- Chức năng:
-- 1. Lưu trữ file và hình ảnh trong tin nhắn
-- 2. Theo dõi thông tin file
CREATE TABLE message_attachments (
    attachment_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi file đính kèm
    message_id INT NOT NULL, -- ID tin nhắn chứa file
    file_url VARCHAR(255) NOT NULL, -- URL file
    file_type VARCHAR(50), -- Loại file
    file_size INT, -- Kích thước file
    created_at DATETIME DEFAULT GETDATE(), -- Thời gian tạo
    FOREIGN KEY (message_id) REFERENCES messages(message_id) -- Đảm bảo message_id tồn tại
);

-- Bảng child_requests_cart: Giỏ yêu cầu mua khóa học của bé
-- Chức năng:
-- 1. Lưu các khóa học bé muốn mua
-- 2. Gửi yêu cầu cho phụ huynh
CREATE TABLE child_requests_cart (
    request_cart_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi yêu cầu
    child_id INT NOT NULL, -- ID học sinh
    course_id INT NOT NULL, -- ID khóa học yêu cầu
    added_at DATETIME DEFAULT GETDATE(), -- Thời gian thêm vào giỏ
    FOREIGN KEY (child_id) REFERENCES users(user_id), -- Đảm bảo child_id tồn tại
    FOREIGN KEY (course_id) REFERENCES courses(course_id) -- Đảm bảo course_id tồn tại
);

-- Bảng shopping_cart: Quản lý giỏ hàng của phụ huynh
-- Chức năng:
-- 1. Lưu các khóa học phụ huynh muốn mua
-- 2. Quản lý yêu cầu từ bé
-- 3. Theo dõi trạng thái phê duyệt
CREATE TABLE shopping_cart (
    cart_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi mục trong giỏ hàng
    parent_id INT NOT NULL, -- ID phụ huynh
    child_id INT NOT NULL, -- ID học sinh được mua cho
    course_id INT NOT NULL, -- ID khóa học
    added_at DATETIME DEFAULT GETDATE(), -- Thời gian thêm vào giỏ
    status_by_parent VARCHAR(20) DEFAULT 'added_directly' CHECK (status_by_parent IN ('pending_approval', 'accepted', 'rejected', 'added_directly')), -- Trạng thái phê duyệt
    FOREIGN KEY (parent_id) REFERENCES users(user_id), -- Đảm bảo parent_id tồn tại
    FOREIGN KEY (child_id) REFERENCES users(user_id), -- Đảm bảo child_id tồn tại
    FOREIGN KEY (course_id) REFERENCES courses(course_id) -- Đảm bảo course_id tồn tại
);

-- Bảng orders: Quản lý đơn hàng
-- Chức năng:
-- 1. Lưu thông tin đơn hàng
-- 2. Theo dõi trạng thái thanh toán
CREATE TABLE orders (
    order_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi đơn hàng
    parent_id INT NOT NULL, -- ID phụ huynh đặt hàng
    total_amount DECIMAL(10,2) NOT NULL, -- Tổng tiền đơn hàng
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')), -- Trạng thái đơn hàng
    created_at DATETIME DEFAULT GETDATE(), -- Thời gian tạo đơn
    FOREIGN KEY (parent_id) REFERENCES users(user_id) -- Đảm bảo parent_id tồn tại
);

-- Bảng order_items: Chi tiết đơn hàng
-- Chức năng:
-- 1. Lưu thông tin chi tiết các khóa học trong đơn hàng
-- 2. Theo dõi bé được mua cho
CREATE TABLE order_items (
    item_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi mục trong đơn hàng
    order_id INT NOT NULL, -- ID đơn hàng
    child_id INT NOT NULL, -- ID học sinh được mua cho
    course_id INT NOT NULL, -- ID khóa học
    price DECIMAL(10,2) NOT NULL, -- Giá khóa học
    FOREIGN KEY (order_id) REFERENCES orders(order_id), -- Đảm bảo order_id tồn tại
    FOREIGN KEY (course_id) REFERENCES courses(course_id), -- Đảm bảo course_id tồn tại
    FOREIGN KEY (child_id) REFERENCES users(user_id) -- Đảm bảo child_id tồn tại
);

-- Bảng ratings: Đánh giá khóa học
-- Chức năng:
-- 1. Lưu đánh giá và bình luận về khóa học
-- 2. Theo dõi phản hồi từ người dùng
CREATE TABLE ratings (
    rating_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi đánh giá
    course_id INT NOT NULL, -- ID khóa học được đánh giá
    user_id INT NOT NULL, -- ID người đánh giá
    rating DECIMAL(2,1) CHECK (rating >= 1 AND rating <= 5), -- Điểm đánh giá (1-5)
    comment NVARCHAR(1000), -- Nhận xét
    created_at DATETIME DEFAULT GETDATE(), -- Thời gian đánh giá
    FOREIGN KEY (course_id) REFERENCES courses(course_id), -- Đảm bảo course_id tồn tại
    FOREIGN KEY (user_id) REFERENCES users(user_id) -- Đảm bảo user_id tồn tại
);

-- Bảng payment_methods: Phương thức thanh toán
-- Chức năng:
-- 1. Lưu thông tin phương thức thanh toán của người dùng
-- 2. Quản lý phương thức thanh toán mặc định
CREATE TABLE payment_methods (
    payment_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi phương thức thanh toán
    user_id INT NOT NULL, -- ID người dùng
    payment_type VARCHAR(50) NOT NULL, -- Loại thanh toán
    account_number VARCHAR(50), -- Số tài khoản
    is_default BIT DEFAULT 0, -- Có phải phương thức mặc định
    created_at DATETIME DEFAULT GETDATE(), -- Thời gian tạo
    FOREIGN KEY (user_id) REFERENCES users(user_id) -- Đảm bảo user_id tồn tại
);

-- Bảng user_notifications: Lịch sử thông báo của người dùng
-- Chức năng:
-- 1. Lưu trữ các thông báo đã gửi
-- 2. Theo dõi trạng thái đọc
-- 3. Liên kết với các mục liên quan
CREATE TABLE user_notifications (
    notification_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi thông báo
    user_id INT NOT NULL, -- ID người nhận thông báo
    sender_id INT, -- ID người gửi thông báo (NULL nếu là hệ thống)
    notification_type VARCHAR(50) NOT NULL, -- Loại thông báo
    content NVARCHAR(MAX), -- Nội dung thông báo
    created_at DATETIME DEFAULT GETDATE(), -- Thời gian tạo thông báo
    is_read BIT DEFAULT 0, -- Trạng thái đã đọc
    related_entity_id INT, -- ID mục liên quan
    FOREIGN KEY (user_id) REFERENCES users(user_id), -- Đảm bảo user_id tồn tại
    FOREIGN KEY (sender_id) REFERENCES users(user_id) -- Đảm bảo sender_id tồn tại
);

-- Bảng transactions: Lưu lịch sử giao dịch
-- Chức năng:
-- 1. Ghi lại các giao dịch thanh toán
-- 2. Theo dõi trạng thái giao dịch
CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi giao dịch
    course_id INT NOT NULL, -- ID khóa học
    parent_id INT NOT NULL, -- ID phụ huynh thanh toán
    amount DECIMAL(10,2) NOT NULL, -- Số tiền giao dịch
    transaction_date DATETIME DEFAULT GETDATE(), -- Thời gian giao dịch
    status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'pending', 'failed')), -- Trạng thái giao dịch
    FOREIGN KEY (course_id) REFERENCES courses(course_id), -- Đảm bảo course_id tồn tại
    FOREIGN KEY (parent_id) REFERENCES users(user_id) -- Đảm bảo parent_id tồn tại
);

-- Bảng learning_history: Ghi lại lịch sử học tập
-- Chức năng:
-- 1. Theo dõi hoạt động học tập của học sinh
-- 2. Ghi nhận thời gian học và chơi
CREATE TABLE learning_history (
    history_id INT PRIMARY KEY IDENTITY(1,1), -- ID định danh cho mỗi hoạt động
    child_id INT NOT NULL, -- ID học sinh
    lesson_id INT, -- ID bài học
    game_id INT, -- ID trò chơi
    video_id INT, -- ID video
    activity_type VARCHAR(20) CHECK (activity_type IN ('lesson', 'game', 'video')), -- Loại hoạt động
    start_time DATETIME NOT NULL, -- Thời gian bắt đầu
    end_time DATETIME, -- Thời gian kết thúc
    FOREIGN KEY (child_id) REFERENCES users(user_id), -- Đảm bảo child_id tồn tại
    FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id), -- Đảm bảo lesson_id tồn tại
    FOREIGN KEY (game_id) REFERENCES games(game_id), -- Đảm bảo game_id tồn tại
    FOREIGN KEY (video_id) REFERENCES videos(video_id) -- Đảm bảo video_id tồn tại
);
