package dev.sonle.filmdb.shared.exception;

import lombok.Getter;

@Getter
public class AppException extends RuntimeException {
    private final AppExceptionCode appExceptionCode;

    public AppException(AppExceptionCode appExceptionCode) {
        super(appExceptionCode.getDefaultMsg());
        this.appExceptionCode = appExceptionCode;
    }

    public AppException(AppExceptionCode appExceptionCode, String customMessage) {
        super(customMessage);
        this.appExceptionCode = appExceptionCode;
    }
}