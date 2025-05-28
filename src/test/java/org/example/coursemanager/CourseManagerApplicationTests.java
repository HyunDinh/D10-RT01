package org.example.coursemanager;

import org.example.coursemanager.tests.DatabaseTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.SQLException;

@SpringBootTest
class CourseManagerApplicationTests {

    @Autowired
    private DataSource dataSource;

    @Test
    void contextLoads() {
    }

    @Test
    void databaseConnection() throws SQLException {
        new DatabaseTest(dataSource).testDatabaseInformation();
    }

}
