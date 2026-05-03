plugins {
    java
}

group = "dev.sonle.filmdb"
version = "1.0.0"
val libs = extensions.getByType<VersionCatalogsExtension>().named("libs")

java {
    toolchain {
        val javaVersion = libs.findVersion("java").get().requiredVersion.toInt()
        languageVersion.set(JavaLanguageVersion.of(javaVersion))
    }
}

dependencies {
    // This shares the dependency with every module that applies this plugin
    implementation(libs.findLibrary("spring-boot-starter-web").get())
    implementation(libs.findLibrary("spring-boot-starter-actuator").get())
//    implementation(libs.findLibrary("spring-boot-starter-web").get())
}

repositories {
    mavenCentral()
}

