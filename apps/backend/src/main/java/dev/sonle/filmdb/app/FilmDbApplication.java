package dev.sonle.filmdb.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication(scanBasePackages = "dev.sonle.filmdb")
@org.springframework.boot.context.properties.ConfigurationPropertiesScan(basePackages = "dev.sonle.filmdb")
@org.springframework.data.jpa.repository.config.EnableJpaRepositories(basePackages = "dev.sonle.filmdb") // detect @Repository bean
@EntityScan(basePackages = "dev.sonle.filmdb")                // detect @Entity bean
@org.springframework.scheduling.annotation.EnableAsync
@org.springframework.cache.annotation.EnableCaching
public class FilmDbApplication {
    public static void main(String[] args) {
//        System.setProperty("spring.output.ansi.enabled", "ALWAYS");
        SpringApplication.run(FilmDbApplication.class, args);
    }
}
