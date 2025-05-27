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

    @Autowired
    private DataSource dataSource;

    @Autowired
    private UserService userService;

    @Test
    void contextLoads() {
    }

    @Test
    void databaseConnection() throws SQLException {

        String type = "connection";

        switch (type) {
            case "add" -> {
                new DatabaseTest(dataSource,userService).addNewUser();
            }
            case "connection" -> {
                new DatabaseTest(dataSource,userService).testDatabaseInformation();
            }
        }


    }


}