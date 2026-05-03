package dev.sonle.filmdb.shared.exception;

import org.springframework.http.HttpStatus;
import lombok.Getter;

@Getter
public enum AppExceptionCode {
    IMPORT_TASK_ERROR("imported pipeline", "Errors occur in a task of imported pipeline", HttpStatus.INTERNAL_SERVER_ERROR),
    TRUNCATE_DB_ERROR("imported pipeline", "Errors occur in a truncating process", HttpStatus.INTERNAL_SERVER_ERROR),
    DATABASE_ERROR("DB", "A database error occurred", HttpStatus.INTERNAL_SERVER_ERROR),

    UNAUTHORIZED("AUTH", "Unauthorized access", HttpStatus.UNAUTHORIZED),

    // API & Client Errors (400)
    VALIDATION_FAILED("SYS", "Input validation failed", HttpStatus.BAD_REQUEST),
    MALFORMED_JSON("SYS", "Malformed JSON request", HttpStatus.BAD_REQUEST),

    // Server & DB Errors (500)
    INTERNAL_SERVER_ERROR("SYS", "An unexpected internal error occurred", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String defaultMsg;
    private final HttpStatus status;

    AppExceptionCode(String code, String defaultMsg, HttpStatus status) {
        this.code = code;
        this.defaultMsg = defaultMsg;
        this.status = status;
    }
}