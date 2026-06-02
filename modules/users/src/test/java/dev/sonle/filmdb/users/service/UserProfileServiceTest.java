package dev.sonle.filmdb.users.service;

import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;
import dev.sonle.filmdb.users.dto.UserInfoDto;
import dev.sonle.filmdb.users.dto.restdto.UserProfileMetadataUpdateDto;
import dev.sonle.filmdb.users.model.Role;
import dev.sonle.filmdb.users.model.UserAuth;
import dev.sonle.filmdb.users.model.UserProfile;
import dev.sonle.filmdb.users.model.UserState;
import dev.sonle.filmdb.users.repository.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserProfileServiceTest {

    @Mock
    private UserProfileRepository userProfileRepository;

    private UserProfileService userProfileService;

    private UUID userId;
    private UserAuth userAuth;
    private UserProfile userProfile;

    @BeforeEach
    void setUp() {
        userProfileService = new UserProfileService(userProfileRepository);

        userId = UUID.randomUUID();
        userAuth = UserAuth.builder()
                .userId(userId)
                .username("testuser")
                .role(Role.USER)
                .userState(UserState.ACTIVE)
                .build();

        userProfile = UserProfile.builder()
                .userAuth(userAuth)
                .username("testuser")
                .bio("My bio")
                .displayName("Test User")
                .build();
        userProfile.setUserId(userId);
        userProfile.setDateCreated(OffsetDateTime.now());
    }

    @Test
    void shouldGetAllUserInfos() {
        when(userProfileRepository.findAll()).thenReturn(List.of(userProfile));

        List<UserInfoDto> result = userProfileService.getAllUserInfos();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("testuser", result.get(0).username());
        assertEquals("My bio", result.get(0).bio());
    }

    @Test
    void shouldGetUserInfoByUserIdAndUsername() {
        when(userProfileRepository.getUserProfileByUserIdAndUsername(userId, "testuser"))
                .thenReturn(Optional.of(userProfile));

        UserInfoDto result = userProfileService.getUserInfo(userId, "testuser");

        assertNotNull(result);
        assertEquals("testuser", result.username());
        assertEquals("Test User", result.displayName());
    }

    @Test
    void shouldThrowExceptionWhenUserProfileNotFoundByName() {
        when(userProfileRepository.getUserProfileByUserIdAndUsername(userId, "nonexistent"))
                .thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () ->
                userProfileService.getUserInfo(userId, "nonexistent")
        );

        assertEquals(BusinessExceptionCode.USER_NOT_FOUND, exception.getBusinessExceptionCode());
    }

    @Test
    void shouldGetUserInfoById() {
        when(userProfileRepository.getUserProfileByUserId(userId)).thenReturn(Optional.of(userProfile));

        UserInfoDto result = userProfileService.getUserInfoById(userId);

        assertNotNull(result);
        assertEquals(userId, result.userId());
        assertEquals("testuser", result.username());
    }

    @Test
    void shouldThrowExceptionWhenUserProfileNotFoundById() {
        when(userProfileRepository.getUserProfileByUserId(userId)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () ->
                userProfileService.getUserInfoById(userId)
        );

        assertEquals(BusinessExceptionCode.USER_NOT_FOUND, exception.getBusinessExceptionCode());
    }

    @Test
    void shouldSyncUserProfileCorrectly() {
        userProfileService.syncUserProfile(userAuth);

        ArgumentCaptor<UserProfile> profileCaptor = ArgumentCaptor.forClass(UserProfile.class);
        verify(userProfileRepository, times(1)).save(profileCaptor.capture());

        UserProfile savedProfile = profileCaptor.getValue();
        assertEquals(userAuth, savedProfile.getUserAuth());
        assertEquals("testuser", savedProfile.getUsername());
        assertEquals("", savedProfile.getBio());
        assertEquals("testuser", savedProfile.getDisplayName());
    }

    @Test
    void shouldUpdateUserProfileMetadata() {
        UserProfileMetadataUpdateDto dto = new UserProfileMetadataUpdateDto("New Bio", "New Display Name");
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(userProfile));

        userProfileService.updateUserProfileMetadata(userId, dto);

        assertEquals("New Bio", userProfile.getBio());
        assertEquals("New Display Name", userProfile.getDisplayName());
        verify(userProfileRepository, times(1)).save(userProfile);
    }

    @Test
    void shouldUpdateOnlyBioWhenDisplayNameIsNull() {
        UserProfileMetadataUpdateDto dto = new UserProfileMetadataUpdateDto("New Bio", null);
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(userProfile));

        userProfileService.updateUserProfileMetadata(userId, dto);

        assertEquals("New Bio", userProfile.getBio());
        assertEquals("Test User", userProfile.getDisplayName()); // unchanged
        verify(userProfileRepository, times(1)).save(userProfile);
    }

    @Test
    void shouldUpdateUsername() {
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(userProfile));

        userProfileService.updateUsername(userId, "newusername");

        assertEquals("newusername", userProfile.getUsername());
        verify(userProfileRepository, times(1)).save(userProfile);
    }
}
