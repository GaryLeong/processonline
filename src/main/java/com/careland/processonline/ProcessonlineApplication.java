package com.careland.processonline;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @author Administrator
 */
@SpringBootApplication
@MapperScan("com.careland.processonline.mapper")
public class ProcessonlineApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProcessonlineApplication.class, args);
    }

}
