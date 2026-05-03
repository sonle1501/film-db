package dev.sonle.filmdb.users.model;

import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;

import java.util.Arrays;

public enum ListType {
    PLAN_TO_WATCH,
    WATCHING,
    WATCHED,
    LIKED,
    LOVED,
    HATED,
    MIXTURE;

    public static ListType fromString (String type){
        if (type == null) throw new BusinessException(BusinessExceptionCode.INVALID_INPUT);

        ListType matchedType = Arrays.stream(ListType.values())
                .filter(listType -> listType.toString().equalsIgnoreCase(type.trim()))
                .findFirst().orElseThrow(() -> new BusinessException(BusinessExceptionCode.INVALID_INPUT));
        return matchedType;
    }
}
