plugins {
    id("filmdb.java-common")
}

dependencies {
    implementation(project(":modules:shared"))

    // external
    compileOnly(libs.lombok)
    annotationProcessor(libs.lombok)
    compileOnly(libs.spring.boot.starter.data.jpa)
}