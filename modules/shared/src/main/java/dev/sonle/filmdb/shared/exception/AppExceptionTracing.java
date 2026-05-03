package dev.sonle.filmdb.shared.exception;

import lombok.Getter;

@Getter
public class AppExceptionTracing extends RuntimeException {
    private final AppExceptionCode appExceptionCode;

    // if u wanna trace error
    public AppExceptionTracing(AppExceptionCode appExceptionCode, String customMessage, Throwable cause) {
        super(customMessage, cause);
        this.appExceptionCode = appExceptionCode;
    }
}