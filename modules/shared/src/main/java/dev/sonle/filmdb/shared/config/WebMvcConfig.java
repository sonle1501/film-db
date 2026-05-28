package dev.sonle.filmdb.shared.config;

import dev.sonle.filmdb.shared.annotation.VersionedApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.HandlerTypePredicate;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.api.version:v1}")
    private String apiVersion;

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // Prepend "/api/{version}" to all REST controllers annotated with @VersionedApi
        configurer.addPathPrefix(
            "/api/" + apiVersion,
            HandlerTypePredicate.forAnnotation(VersionedApi.class)
        );
    }
}
