package d10_rt01.hocho.tests;

import d10_rt01.hocho.repository.ParentChildMappingRepository;
import d10_rt01.hocho.repository.UserRepository;
import d10_rt01.hocho.repository.VideoRepository;
import d10_rt01.hocho.service.user.UserService;
import d10_rt01.hocho.testExtension.TestTerminalUI;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

@SpringBootTest
public class DatabaseTest {

    private static final boolean CLEAR_DATABASE = true;

    // VARIABLES
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private ParentChildMappingRepository parentChildMappingRepository;

    @Autowired
    private DataSource dataSource;

    // SET UP
    @BeforeEach
    public void setUp() {
        if (CLEAR_DATABASE){
            videoRepository.deleteAll();
            parentChildMappingRepository.deleteAll();
            userRepository.deleteAll();
        }
    }

    @Test
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






    // ------------------------------------------------------------------------------------------------------

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