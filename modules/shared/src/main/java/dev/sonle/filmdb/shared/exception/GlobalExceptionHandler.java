package dev.sonle.filmdb.shared.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessException(BusinessException e, HttpServletRequest request) {
        log.warn("[BUSINESS EXCEPTION][{}] - {} | Path: {}",
                e.getBusinessExceptionCode().getCode(),
                e.getMessage(),
                request.getRequestURI());

        return buildBusinessExceptionResponse(e.getBusinessExceptionCode(), e.getMessage(), request.getRequestURI());
    }

    // SCENARIO 1.1: Business Logic & Custom Exceptions (e.g., Cannot find movie)
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiErrorResponse> handleAppException(AppException e, HttpServletRequest request) {
        log.error("✖ [SYSTEM EXCEPTION][{}] - {} | Path: {}",
                e.getAppExceptionCode().getCode(),
                e.getMessage(),
                request.getRequestURI());

        return buildResponse(e.getAppExceptionCode(), e.getMessage(), request.getRequestURI());
    }

    // SCENARIO 1.2: Business Logic & Custom Exceptions and if u wanna trace
    @ExceptionHandler(AppExceptionTracing.class)
    public ResponseEntity<ApiErrorResponse> handleAppExceptionTracing(AppExceptionTracing ex, HttpServletRequest request) {
        log.error("""
              SYSTEM EXCEPTION WITH STACK TRACE
              Code:    {}
              Message: {}
              Path:    {}
              Trace:   """,
                ex.getAppExceptionCode().getCode(),
                ex.getMessage(),
                request.getRequestURI(),
                ex);
        return buildResponse(ex.getAppExceptionCode(), ex.getMessage(), request.getRequestURI());
    }

    // SCENARIO 2: API & Controller Issues (e.g., Invalid email format in DTO)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        log.warn("Validation failed for request: {}", request.getRequestURI());

        // Extract all field errors
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }

        ApiErrorResponse response = ApiErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(AppExceptionCode.VALIDATION_FAILED.getStatus().value())
                .error(AppExceptionCode.VALIDATION_FAILED.getCode())
                .message("Validation failed: " + errors.toString())
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(response, AppExceptionCode.VALIDATION_FAILED.getStatus());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleMessageNotReadable(HttpMessageNotReadableException ex, HttpServletRequest request) {
        log.warn("Malformed JSON payload sent to: {}", request.getRequestURI());
        return buildResponse(AppExceptionCode.MALFORMED_JSON, AppExceptionCode.MALFORMED_JSON.getDefaultMsg(), request.getRequestURI());
    }

    // SCENARIO 3: Database Issues (Spring Data JPA / JDBC)
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiErrorResponse> handleDatabaseException(DataAccessException ex, HttpServletRequest request) {
        // Log the actual SQL error for the developers
        log.error("Database error occurred while accessing {}: ", request.getRequestURI(), ex);

        // Return a generic, safe message to the frontend. NEVER leak SQL statements!
        return buildResponse(AppExceptionCode.DATABASE_ERROR, AppExceptionCode.DATABASE_ERROR.getDefaultMsg(), request.getRequestURI());
    }

    // SCENARIO 4: General, NPE (Null pointer) & Unknown Exceptions (Catch all)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleAllOtherExceptions(Exception ex, HttpServletRequest request) {
        // Log the full stack trace because this is a bug in the code
        log.error("CRITICAL: Unhandled exception caught at {}: ", request.getRequestURI(), ex);

        // Return a generic 500 error
        return buildResponse(AppExceptionCode.INTERNAL_SERVER_ERROR, AppExceptionCode.INTERNAL_SERVER_ERROR.getDefaultMsg(), request.getRequestURI());
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(AppExceptionCode appExceptionCode, String message, String path) {
        ApiErrorResponse response = ApiErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(appExceptionCode.getStatus().value())
                .error(appExceptionCode.getCode())
                .message(message)
                .path(path)
                .build();
        return new ResponseEntity<>(response, appExceptionCode.getStatus());
    }

    private ResponseEntity<ApiErrorResponse> buildBusinessExceptionResponse(BusinessExceptionCode businessExceptionCode, String message, String path) {
        ApiErrorResponse response = ApiErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(businessExceptionCode.getStatus().value())
                .error(businessExceptionCode.getCode())
                .message(message)
                .path(path)
                .build();
        return new ResponseEntity<>(response, businessExceptionCode.getStatus());
    }
}