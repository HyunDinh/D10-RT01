package d10_rt01.hocho;

import d10_rt01.hocho.repository.UserRepository;
import d10_rt01.hocho.tests.DatabaseTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.SQLException;
import java.time.Instant;

@SpringBootTest
class HochoApplicationTests {


    // TESTS
    @Test
    void databaseConnection() throws SQLException {
        new DatabaseTest().testDatabaseInformation();
    }


}