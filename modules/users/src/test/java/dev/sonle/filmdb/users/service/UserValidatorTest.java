package dev.sonle.filmdb.users.service;

import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;
import dev.sonle.filmdb.users.model.UserAuth;
import dev.sonle.filmdb.users.repository.UserAuthRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserValidatorTest {

    @Mock
    private UserAuthRepository userAuthRepository;

    private UserValidator userValidator;

    @BeforeEach
    void setUp() {
        userValidator = new UserValidator(userAuthRepository);
    }

    @Test
    void shouldThrowExceptionWhenUsernameIsEmptyOrNull() {
        BusinessException exception = assertThrows(BusinessException.class, () ->
                userValidator.validateUsernameAndPassword(null, "password")
        );
        assertEquals(BusinessExceptionCode.INVALID_INPUT, exception.getBusinessExceptionCode());
        assertEquals("Username is required", exception.getMessage());

        exception = assertThrows(BusinessException.class, () ->
                userValidator.validateUsernameAndPassword("  ", "password")
        );
        assertEquals(BusinessExceptionCode.INVALID_INPUT, exception.getBusinessExceptionCode());
        assertEquals("Username is required", exception.getMessage());

        verifyNoInteractions(userAuthRepository);
    }

    @Test
    void shouldThrowExceptionWhenUsernameAlreadyExists() {
        String username = "existinguser";
        UserAuth mockUser = new UserAuth();
        when(userAuthRepository.findByUsername(username)).thenReturn(Optional.of(mockUser));

        BusinessException exception = assertThrows(BusinessException.class, () ->
                userValidator.validateUsernameAndPassword(username, "password")
        );
        
        assertEquals(BusinessExceptionCode.USER_ALREADY_EXISTS, exception.getBusinessExceptionCode());
        assertTrue(exception.getMessage().contains("already exist"));
        verify(userAuthRepository, times(1)).findByUsername(username);
    }

    @Test
    void shouldThrowExceptionWhenPasswordIsTooShort() {
        String username = "newuser";
        when(userAuthRepository.findByUsername(username)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () ->
                userValidator.validateUsernameAndPassword(username, "12") // 2 chars, limit is 3
        );
        
        assertEquals(BusinessExceptionCode.INVALID_INPUT, exception.getBusinessExceptionCode());
        assertEquals("Password must be at least 3 characters long", exception.getMessage());
    }

    @Test
    void shouldPassValidationWithValidCredentials() {
        String username = "validuser";
        when(userAuthRepository.findByUsername(username)).thenReturn(Optional.empty());

        assertDoesNotThrow(() ->
                userValidator.validateUsernameAndPassword(username, "strongpassword")
        );
    }
}
