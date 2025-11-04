package com.internregister;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class InternRegisterApplication {

    public static void main(String[] args) {
        SpringApplication.run(InternRegisterApplication.class, args);
    }

}
