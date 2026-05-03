package dev.sonle.filmdb.users.service;

import dev.sonle.filmdb.shared.exception.AppException;
import dev.sonle.filmdb.shared.exception.AppExceptionCode;
import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;
import dev.sonle.filmdb.users.dto.UserProfileDto;
import dev.sonle.filmdb.users.dto.restdto.UserProfileMetadataUpdateDto;
import dev.sonle.filmdb.users.model.UserAuth;
import dev.sonle.filmdb.users.model.UserProfile;
import dev.sonle.filmdb.users.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    @Transactional(readOnly = true)
    public List<UserProfileDto> getAllUserProfiles() {
        return userProfileRepository.findAll().stream()
                .map(UserProfileDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserProfileDto getUserProfile(UUID userId, String username){
        return userProfileRepository.getUserProfileByUserIdAndUsername(userId, username)
                .map(UserProfileDto::from)
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.USER_NOT_FOUND, "Cannot found UserProfile"));
    }

    @Transactional
    void syncUserProfile(UserAuth userAuth){
        String username = userAuth.getUsername();
        UserProfile userProfile = UserProfile.builder() // userPofile model has @mapID, so do not initialize the id
                .userAuth(userAuth)
                .username(username)
                .bio("")
                .displayName(username)
                .build();

        userProfileRepository.save(userProfile);
    }

    @Transactional
    public void updateUserProfileMetadata(UUID userId, UserProfileMetadataUpdateDto dto) {
        UserProfile userProfile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.USER_NOT_FOUND, "Cannot found UserProfile"));
        
        if (dto.bio() != null) {
            userProfile.setBio(dto.bio());
        }
        if (dto.displayName() != null) {
            userProfile.setDisplayName(dto.displayName());
        }
        userProfileRepository.save(userProfile);
    }

    @Transactional
    public void updateUsername(UUID userId, String newUsername) {
        UserProfile userProfile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(BusinessExceptionCode.USER_NOT_FOUND, "Cannot found UserProfile"));
        userProfile.setUsername(newUsername);
        userProfileRepository.save(userProfile);
    }
}

