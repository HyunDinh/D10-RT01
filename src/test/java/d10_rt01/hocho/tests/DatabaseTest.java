package d10_rt01.hocho.tests;

import d10_rt01.hocho.repository.ParentChildMappingRepository;
import d10_rt01.hocho.repository.UserRepository;
import d10_rt01.hocho.repository.VideoRepository;
import d10_rt01.hocho.testExtension.DatabaseCleaner;
import d10_rt01.hocho.testExtension.TestTerminalUI;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

@SpringBootTest
public class DatabaseTest {

    private static final boolean CLEAR_DATABASE = true;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private ParentChildMappingRepository parentChildMappingRepository;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DatabaseCleaner databaseCleaner;

    @BeforeEach
    public void setUp() {
        if (CLEAR_DATABASE) {
            databaseCleaner.clearAllTables();
        }
    }

    @Test
    public void testDatabaseInformation() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            if (connection != null && !connection.isClosed()) {
                TestTerminalUI.printTestTitle("Database Connection Status");
                TestTerminalUI.printStatus(true, "Connection Status: SUCCESS");

                DatabaseMetaData metaData = connection.getMetaData();
                String databaseName = connection.getCatalog();
                String url = metaData.getURL();
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

    private List<String> getTableNames(Connection connection) throws SQLException {
        List<String> tableNames = new ArrayList<>();
        DatabaseMetaData metaData = connection.getMetaData();
        try (ResultSet rs = metaData.getTables(null, null, "%", new String[]{"TABLE"})) {
            while (rs.next()) {
                String tableName = rs.getString("TABLE_NAME");
                String tableType = rs.getString("TABLE_TYPE");
                if ("TABLE".equals(tableType) && !tableName.startsWith("sys") && !tableName.startsWith("INFORMATION_SCHEMA")) {
                    tableNames.add(tableName);
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
                    recordCounts.add(0L);
                }
            } catch (SQLException e) {
                System.err.println("Lỗi khi đếm số record cho bảng " + table + ": " + e.getMessage());
                recordCounts.add(0L);
            }
        }
        return recordCounts;
    }
}