plugins {
    `kotlin-dsl`
}

group = "dev.sonle.buildlogic"
version = "1.0.0"

repositories {
    mavenCentral()
    gradlePluginPortal()
}

dependencies {
    implementation(libs.spring.boot.gradle.plugin)
}
