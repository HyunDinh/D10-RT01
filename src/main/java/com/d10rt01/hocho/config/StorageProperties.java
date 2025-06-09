package com.d10rt01.hocho.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties("storage")
public class StorageProperties {

    /**
     * Folder location for storing files
     */
    private String location = Configs.ABSOLUTE_PATH_LESSON_CONTENT_UPLOAD_DIR;

}
