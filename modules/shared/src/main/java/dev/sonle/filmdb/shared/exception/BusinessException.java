package dev.sonle.filmdb.shared.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final BusinessExceptionCode businessExceptionCode;

    public BusinessException(BusinessExceptionCode businessExceptionCode) {
        super(businessExceptionCode.getDefaultMsg());
        this.businessExceptionCode = businessExceptionCode;
    }

    public BusinessException(BusinessExceptionCode businessExceptionCode, String customMessage) {
        super(customMessage);
        this.businessExceptionCode = businessExceptionCode;
    }
}