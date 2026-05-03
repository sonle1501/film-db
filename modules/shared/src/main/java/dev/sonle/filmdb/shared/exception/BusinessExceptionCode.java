package dev.sonle.filmdb.shared.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum BusinessExceptionCode {
    // Business & Domain Errors (404, 400, 409)
    MOVIE_NOT_FOUND("IMDB domain", "Movie not found in the database", HttpStatus.NOT_FOUND),
    MOVIE_INFO_NOT_FOUND("IMDB domain", "Movie extra info not found in the database", HttpStatus.NOT_FOUND),
    PERSON_NOT_FOUND("IMDB domain", "Person info not found in the database", HttpStatus.NOT_FOUND),
    USER_ALREADY_EXISTS("USER domain" ,"USER_ALREADY_EXISTS", HttpStatus.CONFLICT),
    LIST_ALREADY_EXISTS("USER domain" ,"LIST_ALREADY_EXISTS", HttpStatus.CONFLICT),
    ITEM_ALREADY_EXISTS("USER domain" ,"ITEM ALREADY EXIST", HttpStatus.CONFLICT),
    USER_NOT_FOUND("USER domain" ,"USER_NOT_FOUND", HttpStatus.NOT_FOUND),
    LIST_NOT_FOUND("USER domain" ,"LIST_NOT_FOUND", HttpStatus.NOT_FOUND),
    ITEM_NOT_FOUND("USER domain" ,"LIST_ITEM_NOT_FOUND", HttpStatus.NOT_FOUND),
    ITEM_NOT_VALID("USER domain" ,"LIST_ITEM_NOT_VALID", HttpStatus.NOT_FOUND),
    INVALID_INPUT("USER domain", "INVALID_INPUT", HttpStatus.CONFLICT),
    UNAUTHORIZED_ACCESS("USER domain", "Access denied", HttpStatus.FORBIDDEN);

    private final String code;
    private final String defaultMsg;
    private final HttpStatus status;

    BusinessExceptionCode(String code, String defaultMsg, HttpStatus status) {
        this.code = code;
        this.defaultMsg = defaultMsg;
        this.status = status;
    }
}