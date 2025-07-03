package d10_rt01.hocho.testExtension;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import org.springframework.stereotype.Service;

import java.io.File;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

@Service
public class DatabaseCleaner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private EntityScanner entityScanner;

    public void clearAllTables() {
        List<String> tables = entityScanner.getEntityTableNamesWithOrder("d10_rt01.hocho.model");

        // Bước 1: Vô hiệu hóa tất cả các ràng buộc khóa ngoại
        jdbcTemplate.execute("EXEC sp_MSforeachtable @command1=\"ALTER TABLE ? NOCHECK CONSTRAINT ALL\"");
        // Bước 2: Vô hiệu hóa tất cả các trigger
        jdbcTemplate.execute("EXEC sp_MSforeachtable @command1=\"ALTER TABLE ? DISABLE TRIGGER ALL\"");

        // Bước 3: Xóa dữ liệu từ tất cả các bảng theo thứ tự đã sắp xếp
        for (String table : tables) {
            try {
                jdbcTemplate.execute("TRUNCATE TABLE " + table);
            } catch (Exception e) {
                // Fallback sang DELETE nếu TRUNCATE thất bại
                jdbcTemplate.execute("DELETE FROM " + table);
            }
        }

        // Bước 4: Kích hoạt lại tất cả các ràng buộc và trigger
        jdbcTemplate.execute("EXEC sp_MSforeachtable @command1=\"ALTER TABLE ? CHECK CONSTRAINT ALL\"");
        jdbcTemplate.execute("EXEC sp_MSforeachtable @command1=\"ALTER TABLE ? ENABLE TRIGGER ALL\"");

        // Làm mới EntityManager
        entityManager.clear();
    }
}

@Component
class EntityScanner {

    private final DataSource dataSource;

    public EntityScanner(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<String> getEntityTableNamesWithOrder(String packageName) {
        List<String> tableNames = new ArrayList<>();
        Map<String, List<String>> foreignKeyMap = new HashMap<>();
        String path = packageName.replace(".", "/");

        try {
            // Lấy danh sách entity từ package
            String basePath = new File("src/main/java/" + path).getAbsolutePath();
            File folder = new File(basePath);
            if (folder.exists() && folder.isDirectory()) {
                File[] files = folder.listFiles((dir, name) -> name.endsWith(".java"));
                if (files != null) {
                    for (File file : files) {
                        String className = packageName + "." + file.getName().replace(".java", "");
                        Class<?> clazz = Class.forName(className);
                        if (clazz.isAnnotationPresent(Entity.class)) {
                            Table tableAnnotation = clazz.getAnnotation(Table.class);
                            String tableName = (tableAnnotation != null && !tableAnnotation.name().isEmpty())
                                    ? tableAnnotation.name()
                                    : clazz.getSimpleName();
                            tableNames.add(tableName);
                        }
                    }
                }
            }

            // Lấy thông tin khóa ngoại từ database với catalog
            try (Connection connection = dataSource.getConnection()) {
                String catalog = connection.getCatalog(); // Lấy tên cơ sở dữ liệu hiện tại
                if (catalog == null) {
                    throw new IllegalStateException("Catalog (database name) is not set in the connection!");
                }
                DatabaseMetaData metaData = connection.getMetaData();
                try (ResultSet rs = metaData.getImportedKeys(catalog, null, null)) {
                    while (rs.next()) {
                        String fkTableName = rs.getString("FKTABLE_NAME");
                        String pkTableName = rs.getString("PKTABLE_NAME");
                        foreignKeyMap.computeIfAbsent(pkTableName, k -> new ArrayList<>()).add(fkTableName);
                    }
                }
            }

            // Sắp xếp thứ tự xóa (bảng con trước, bảng cha sau)
            List<String> sortedTables = new ArrayList<>();
            for (String table : tableNames) {
                addTableInOrder(table, foreignKeyMap, sortedTables);
            }
            return sortedTables;

        } catch (Exception e) {
            e.printStackTrace();
            return tableNames; // Fallback nếu có lỗi
        }
    }

    private void addTableInOrder(String table, Map<String, List<String>> foreignKeyMap, List<String> sortedTables) {
        if (sortedTables.contains(table)) return;
        List<String> dependentTables = foreignKeyMap.getOrDefault(table, new ArrayList<>());
        for (String dependentTable : dependentTables) {
            addTableInOrder(dependentTable, foreignKeyMap, sortedTables);
        }
        if (!sortedTables.contains(table)) {
            sortedTables.add(table);
        }
    }
}