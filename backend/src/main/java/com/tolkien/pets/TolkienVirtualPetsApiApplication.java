package com.tolkien.pets;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class TolkienVirtualPetsApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(TolkienVirtualPetsApiApplication.class, args);
    }
}
