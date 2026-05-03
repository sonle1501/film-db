package dev.sonle.filmdb.users.service;

import dev.sonle.filmdb.shared.exception.AppException;
import dev.sonle.filmdb.shared.exception.AppExceptionCode;
import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;
import dev.sonle.filmdb.users.dto.restdto.RegisterRequestDto;
import dev.sonle.filmdb.users.repository.UserAuthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserValidator {

    private final UserAuthRepository userAuthRepository;

    public void validateUsernameAndPassword(String username, String password) {
        if (username == null || username.isBlank()) {
            throw new BusinessException(BusinessExceptionCode.INVALID_INPUT, "Username is required");
        }

        if (userAuthRepository.findByUsername(username).isPresent()) {
            throw new BusinessException(
                    BusinessExceptionCode.USER_ALREADY_EXISTS,
                    "Username '" + username + "' is already exist"
            );
        }

        // password strength custom
        if (password.length() < 3) {
            throw new BusinessException(
                    BusinessExceptionCode.INVALID_INPUT,
                    "Password must be at least 3 characters long"
            );
        }
    }
}
