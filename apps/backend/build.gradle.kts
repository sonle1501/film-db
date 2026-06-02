plugins {
    id("filmdb.java-common")
    id("filmdb.env-loader")
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.dependency.management)
}

dependencies {
    // internal
    implementation(project(":modules:importer"))
    implementation(project(":modules:search"))
    implementation(project(":modules:imdb"))
    implementation(project(":modules:shared"))
    implementation(project(":modules:users"))
    implementation(project(":modules:admin"))

    // external
    implementation(libs.flyway.core)
    implementation(libs.flyway.database.postgresql)
    implementation(libs.postgresql)
    implementation(libs.spring.boot.starter.data.jpa)
    implementation("org.springframework.boot:spring-boot-starter-actuator")

}