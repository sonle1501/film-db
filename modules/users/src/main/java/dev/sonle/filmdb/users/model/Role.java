package dev.sonle.filmdb.users.model;

import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;

import java.util.Arrays;

public enum Role {
    ADMIN,
    USER;

    public static Role fromString(String role){
        Role res = Arrays.stream(Role.values())
                .filter(value -> value.toString().equalsIgnoreCase(role.trim()))
                .findFirst().orElseThrow(() -> new BusinessException(BusinessExceptionCode.INVALID_INPUT, "cannot find the role: " + role));
        return res;
    }
}


