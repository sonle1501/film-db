package dev.sonle.filmdb.users.controller;

import dev.sonle.filmdb.users.dto.UserProfileDto;
import dev.sonle.filmdb.users.dto.restdto.ChangeUsernameRequestDto;
import dev.sonle.filmdb.users.dto.restdto.UserProfileMetadataUpdateDto;
import dev.sonle.filmdb.users.model.UserAuth;
import dev.sonle.filmdb.users.service.AuthService;
import dev.sonle.filmdb.users.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user/profile")
@RequiredArgsConstructor
public class UserController {
    private final UserProfileService userProfileService;
    private final AuthService authService;

    @GetMapping()
    public ResponseEntity<UserProfileDto> getUserProfile(@RequestParam("username") String username, @AuthenticationPrincipal UserAuth userAuth){
        UserProfileDto userProfileDto = userProfileService.getUserProfile(userAuth.getUserId(), username);
        return ResponseEntity.ok(userProfileDto);
    }

    @PatchMapping()
    public ResponseEntity<String> updateUserProfileMetadata(@RequestBody UserProfileMetadataUpdateDto userRequest, @AuthenticationPrincipal UserAuth userAuth){
        userProfileService.updateUserProfileMetadata(userAuth.getUserId(), userRequest);
        return ResponseEntity.ok("no content");
    }

    @PutMapping("/username")
    public ResponseEntity<String> changeUsername(@RequestBody ChangeUsernameRequestDto userRequest){
        authService.changeUsername(userRequest);
        return ResponseEntity.ok("no content");
    }
}
