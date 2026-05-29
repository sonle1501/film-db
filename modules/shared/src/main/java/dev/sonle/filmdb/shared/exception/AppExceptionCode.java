package dev.sonle.filmdb.shared.exception;

import org.springframework.http.HttpStatus;
import lombok.Getter;

@Getter
public enum AppExceptionCode {
    IMPORT_TASK_ERROR("imported pipeline", "IMPORT_TASK_ERROR", HttpStatus.INTERNAL_SERVER_ERROR),
    TRUNCATE_DB_ERROR("imported pipeline", "TRUNCATE_DB_ERROR", HttpStatus.INTERNAL_SERVER_ERROR),
    DATABASE_ERROR("DB", "DATABASE_ERROR", HttpStatus.INTERNAL_SERVER_ERROR),

    UNAUTHORIZED("AUTH", "UNAUTHORIZED", HttpStatus.UNAUTHORIZED),
    IMDB_SERVER_EXCEPTION("IMDB SERVER", "IMDB_SERVER_EXCEPTION", HttpStatus.BAD_GATEWAY),

    // API & Client Errors (400)
    VALIDATION_FAILED("SYS", "VALIDATION_FAILED", HttpStatus.BAD_REQUEST),
    MALFORMED_JSON("SYS", "MALFORMED_JSON", HttpStatus.BAD_REQUEST),

    // Server & DB Errors (500)
    INTERNAL_SERVER_ERROR("SYS", "INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String defaultMsg;
    private final HttpStatus status;

    AppExceptionCode(String code, String defaultMsg, HttpStatus status) {
        this.code = code;
        this.defaultMsg = defaultMsg;
        this.status = status;
    }
}