package dev.sonle.filmdb.users.model;

import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;

import java.util.Arrays;

public enum UserState {
    ACTIVE,
    BANNED,
    PENDING;
}
