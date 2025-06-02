# Hocho Template
Build a management system that provides an online educational and entertainment environment for children.

Hoàn thành backend front end cho giỏ hàng (trẻ em xem giỏ hàng ,thêm khóa học vào giỏ hàng , xóa khóa học khỏi giỏ hàng , gửi yêu cầu cho phụ huynh mua khóa học . Phụ huynh xem được giỏ hàng , phê duyệt đơn hàng (đồng ý hoặc từ chối mua) , xóa đơn hàng khỏi giỏ hàng , thêm trực tiếp khóa học vào giỏ hàng) , chưa có trang để thêm khóa học vào giỏ hàng của trẻ em và phụ huynh
, gia sư (tạo hồ sơ gia sư , hiển thị tất cả gia sư , sửa thông tin gia sư , xóa thông tin gia sư , xem chi tiết gia sư , phê duyệt gia sư (đồng ý , từ chối) ) 
câu hỏi và trả lời (Update lại  QuestionService và aAnswerRepository để có thể khi xóa câu hỏi thì xóa hết câu trả lời của câu hỏi đó . ).



# How to setting the project cloned from Github :

```bash
 Step 1 : check information in application.properties
 - check database connection
 - check thymeleaf setting
 
 Step 2 : right click folder "extension" -> "mark directory as" -> "Source root"
 - make sure default database testcase works in file HochoApplicationTests.java
 
 Step 3 : right click folder "storage" -> "mark directory as" -> "Resource root"
 - make sure datatypes including png,pdf,.. storage is available
 
 Step 4 : // TODO
```
