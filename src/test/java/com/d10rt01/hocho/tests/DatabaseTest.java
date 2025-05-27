package com.d10rt01.hocho.tests;

import com.d10rt01.hocho.model.User;
import com.d10rt01.hocho.service.user.UserService;
import test.TestTerminalUI;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.sql.*;
import java.time.Instant;


public class DatabaseTest {

    private final DataSource dataSource;
    private final UserService userService;

    public DatabaseTest(DataSource dataSource, UserService userService) {
        this.dataSource = dataSource;
        this.userService = userService;
    }

    public void testDatabaseInformation() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            if (connection != null && !connection.isClosed()) {
                // Header
                TestTerminalUI.printTestTitle("Database Connection Status");

                // Connection Status
                TestTerminalUI.printStatus(true, "Connection Status: SUCCESS");

                // Database Information
                DatabaseMetaData metaData = connection.getMetaData();
                String databaseName = connection.getCatalog();
                String url = metaData.getURL();
                // Tóm tắt URL để gọn hơn
                String shortUrl = url.length() > 50 ? url.substring(0, 50) + "..." : url;

                List<String> tables = getTableNames(connection);
                List<Long> tableRecordCounts = getTableRecordCounts(connection, tables);

                Map<String, String> dbInfo = new LinkedHashMap<>();
                dbInfo.put("Product Name", metaData.getDatabaseProductName());
                dbInfo.put("Product Version", metaData.getDatabaseProductVersion());
                dbInfo.put("Driver Name", metaData.getDriverName());
                dbInfo.put("Driver Version", metaData.getDriverVersion());
                dbInfo.put("URL", shortUrl);
                dbInfo.put("Username", metaData.getUserName());
                dbInfo.put("Database Name", databaseName);

                TestTerminalUI.printKeyValueTable("Database Information", dbInfo);

                // Updated Tables section using printTable
                Map<String, String> tableList = new LinkedHashMap<>();
                for (int i = 0; i < tables.size(); i++) {
                    tableList.put(String.valueOf(i + 1), tables.get(i) + " : " + tableRecordCounts.get(i) + " records");
                }
                TestTerminalUI.printKeyValueTable("Tables in Database", tableList);

            } else {
                TestTerminalUI.printStatus(false, "Connection Status: FAILED");
            }
        } catch (SQLException e) {
            TestTerminalUI.printStatus(false, "Error connecting to database: " + e.getMessage());
            throw new RuntimeException("Database connection failed!", e);
        }
    }

    public void addNewUser() {
        TestTerminalUI.printTestTitle("Add New User Test");

        try {
            // Tạo một User mới
            User user = new User();
            user.setUsername("admin");
            user.setPasswordHash("123");
            user.setEmail("testuser@example.com");
            user.setPhoneNumber("1234567890");
            user.setFullName("Test User");
            user.setRole("admin");
            user.setIsActive(true);
            user.setCreatedAt(Instant.now());
            user.setUpdatedAt(Instant.now());

            // Gọi UserService để thêm User
            User savedUser = userService.addUser(user);

            // In kết quả
            Map<String, String> userInfo = new LinkedHashMap<>();
            userInfo.put("User ID", savedUser.getId() != null ? savedUser.getId().toString() : "N/A");
            userInfo.put("Username", savedUser.getUsername());
            userInfo.put("Email", savedUser.getEmail());
            userInfo.put("Role", savedUser.getRole());
            userInfo.put("Active", savedUser.getIsActive().toString());
            TestTerminalUI.printKeyValueTable("New User Added", userInfo);
            TestTerminalUI.printStatus(true, "Add User: SUCCESS");
        } catch (IllegalArgumentException e) {
            TestTerminalUI.printStatus(false, "Add User: FAILED - " + e.getMessage());
            throw e;
        } catch (Exception e) {
            TestTerminalUI.printStatus(false, "Add User: FAILED - Unexpected error: " + e.getMessage());
            throw new RuntimeException("Failed to add user", e);
        }
    }

    private List<String> getTableNames(Connection connection) throws SQLException {
        List<String> tableNames = new ArrayList<>();
        // Danh sách các bảng cần bỏ qua
        List<String> tablesToSkip = Arrays.asList("trace_xe_action_map", "trace_xe_event_map");
        DatabaseMetaData metaData = connection.getMetaData();
        try (ResultSet rs = metaData.getTables(null, null, "%", new String[]{"TABLE"})) {
            while (rs.next()) {
                String tableName = rs.getString("TABLE_NAME");
                // Chỉ thêm bảng nếu không nằm trong danh sách bỏ qua
                if (!tablesToSkip.contains(tableName)) {
                    tableNames.add(tableName);
                } else {
                    // TODO
                }
            }
        }
        return tableNames;
    }

    private List<Long> getTableRecordCounts(Connection connection, List<String> tables) throws SQLException {
        List<Long> recordCounts = new ArrayList<>();
        for (String table : tables) {
            try (Statement stmt = connection.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM " + table)) {
                if (rs.next()) {
                    recordCounts.add(rs.getLong(1));
                } else {
                    recordCounts.add(0L); // In case no result is returned
                }
            } catch (SQLException e) {
                // Log error and add 0 as fallback to avoid breaking the loop
                System.err.println("Lỗi khi đếm số record cho bảng " + table + ": " + e.getMessage());
                recordCounts.add(0L);
            }
        }
        return recordCounts;
    }

}