package dev.sonle.filmdb.users.model;

import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;

import java.util.Arrays;

public enum UserState {
    ACTIVE,
    BANNED,
    ADMIN_PENDING;

    public static UserState fromString(String state){
        UserState res = Arrays.stream(UserState.values())
                .filter(value -> value.toString().equalsIgnoreCase(state.trim()))
                .findFirst().orElseThrow(() -> new BusinessException(BusinessExceptionCode.INVALID_INPUT, "cannot find the state: " + state));
        return res;
    }
}
