package com.d10rt01.hocho;

import com.d10rt01.hocho.service.user.UserService;
import com.d10rt01.hocho.tests.DatabaseTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.SQLException;

@SpringBootTest
class HochoApplicationTests {

    private static final String databaseOption = "1";


    @Autowired
    private DataSource dataSource;

    @Autowired
    private UserService userService;

    @Test
    void databaseConnection() throws SQLException {
        switch (databaseOption) {
            case "0" -> {
                new DatabaseTest(dataSource,userService).testDatabaseInformation();
            }
            case "1" -> {
                new DatabaseTest(dataSource,userService).addNewUser();
            }
        }
    }

}