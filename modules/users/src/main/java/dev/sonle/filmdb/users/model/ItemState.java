package dev.sonle.filmdb.users.model;

import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;

import java.util.Arrays;
import java.util.Optional;

public enum ItemState {
    PLAN_TO_WATCH,
    WATCHING,
    WATCHED,
    LIKED,
    LOVED,
    HATED,
    NEUTRAL;

    public static ItemState fromString(String type){
        ItemState res = Arrays.stream(ItemState.values())
                .filter(value -> value.toString().equalsIgnoreCase(type.trim()))
                .findFirst().orElseThrow(() -> new BusinessException(BusinessExceptionCode.INVALID_INPUT));
        return res;
    }
}
