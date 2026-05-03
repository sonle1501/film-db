plugins {
    id("filmdb.java-common")
}

dependencies {
    // external

    compileOnly(libs.lombok)
    annotationProcessor(libs.lombok)
    compileOnly(libs.spring.boot.starter.data.jpa) // for handle org.springframework.dao.DataAccessException;
    implementation(libs.spring.boot.starter.security)
    implementation(libs.jjwt.api)
    implementation(libs.jjwt.impl)
    implementation(libs.jjwt.jackson)
}