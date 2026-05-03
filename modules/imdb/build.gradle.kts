plugins {
    id("filmdb.java-common")
}

dependencies {
    // internal
    implementation(project(":modules:shared"))

    // external
    implementation(libs.spring.boot.starter.jdbc)
    implementation(libs.spring.boot.starter.data.jpa)
    compileOnly(libs.lombok)
    annotationProcessor(libs.lombok)
    implementation(libs.postgresql)
    implementation(libs.springdoc.openapi.starter.webmvc.ui)

}