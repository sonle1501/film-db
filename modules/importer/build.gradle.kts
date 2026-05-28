plugins {
    id("filmdb.java-common")
}

dependencies {
    implementation(project(":modules:shared"))

    // external
    implementation(libs.spring.boot.starter.jdbc)
    implementation(libs.spring.boot.starter.data.jpa)
    compileOnly(libs.lombok)
    annotationProcessor(libs.lombok)
    annotationProcessor(libs.spring.boot.configuration.processor)
    implementation(libs.postgresql)
}