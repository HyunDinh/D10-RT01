# D10-RT01 ----------- HOCHO ------------
Build a management system that provides an online educational and entertainment environment for children.
( this branch demonstrates how to create the project or how to clone the project, also setup tasks guilds )

## Create the project :

```bash
REQUIREMENTS : INTELLIJ ULTIMATE - SPRING WEB

Including :
- maven
- JDK : openJDK 17 or higher
- Java version : 17
- Packaging : jar

Dependencies :
- Spring web
- Spring Data JPA
- Spring security
- Thymeleaf
- MS SQL Server Driver
- Spring Boot Devtools
- Spring Boot Actuator
- Lombok
```

## Application.properties :



```bash
spring.application.name=Hocho

# MS SQL Server Config
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=hocho;encrypt=false;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=123
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.open-in-view=false

# default default
spring.security.user.name=admin
spring.security.user.password=123

# Actuator config
management.endpoints.web.exposure.include=health,info

# Server config
server.port=8080

# thymeleaf setting
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html
spring.mvc.static-path-pattern=/**
spring.web.resources.static-locations=classpath:/static/
```

## Push project into github with branch :
```bash
git init
git remote add origin https://github.com/HyunDinh/D10-RT01.git
git fetch origin
git checkout -b Dinh_Hung origin/Dinh_Hung
git add .
git commit -m "Update code in Dinh_Hung"
git push
```
