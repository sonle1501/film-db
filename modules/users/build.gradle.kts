plugins {
    id("filmdb.java-common")
}

dependencies {
    // internal
    implementation(project(":modules:shared"))
    // external

    compileOnly(libs.lombok)
    annotationProcessor(libs.lombok)
    compileOnly(libs.spring.boot.starter.data.jpa) // for handle org.springframework.dao.DataAccessException;
    implementation(libs.spring.boot.starter.security)
    implementation(libs.springdoc.openapi.starter.webmvc.ui)

}