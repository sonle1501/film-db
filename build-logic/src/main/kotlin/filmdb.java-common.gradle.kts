import org.gradle.api.tasks.testing.Test
import org.gradle.api.tasks.InputFiles
import org.gradle.api.tasks.PathSensitive
import org.gradle.api.tasks.PathSensitivity
import org.gradle.api.file.FileCollection
import org.gradle.process.CommandLineArgumentProvider

plugins {
    id("java-library")
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

val mockitoAgent by configurations.creating

dependencies {
    // This shares the dependency with every module that applies this plugin
    implementation(libs.findLibrary("spring-boot-starter-web").get())
    implementation(libs.findLibrary("spring-boot-starter-actuator").get())
//    implementation(libs.findLibrary("spring-boot-starter-web").get())

    testImplementation(platform("org.springframework.boot:spring-boot-dependencies:${libs.findVersion("springBoot").get().requiredVersion}"))
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

    mockitoAgent(platform("org.springframework.boot:spring-boot-dependencies:${libs.findVersion("springBoot").get().requiredVersion}"))
    mockitoAgent("org.mockito:mockito-core") {
        isTransitive = false
    }
}

repositories {
    mavenCentral()
}

class MockitoAgentProvider(
    @get:InputFiles
    @get:PathSensitive(PathSensitivity.NONE)
    val agentFiles: FileCollection
) : CommandLineArgumentProvider {
    override fun asArguments(): Iterable<String> {
        return agentFiles.files.map { "-javaagent:${it.absolutePath}" }
    }
}

tasks.withType<Test>().configureEach {
    useJUnitPlatform()
    jvmArgs("-XX:+EnableDynamicAgentLoading")
    jvmArgumentProviders.add(MockitoAgentProvider(project.files(mockitoAgent)))
}


