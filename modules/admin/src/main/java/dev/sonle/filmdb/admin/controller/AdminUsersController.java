package dev.sonle.filmdb.admin.controller;

import dev.sonle.filmdb.admin.service.AdminJobService;
import dev.sonle.filmdb.shared.interfaces.UserListInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/admin/users")
public class AdminUsersController {

    private final UserListInterface userListInterface;
    private AdminJobService adminJobService;

    @GetMapping("/user-infos")
    public ResponseEntity<List<UserListInterface.UserInfoProjection>> getAllUserInfos() {
        return ResponseEntity.ok(userListInterface.getAllUserInfos());
    }

    @GetMapping("/{user-id}/user-info")
    public ResponseEntity<UserListInterface.UserInfoProjection> getUserInfo(@PathVariable("user-id") UUID userId) {

        return ResponseEntity.ok(userListInterface.getUserInfo(userId));
    }

    @PutMapping("/{user-id}/state/ban")
    public ResponseEntity<String> banUser(@PathVariable("user-id") UUID userId) {
        adminJobService.banUser(userId);
        return ResponseEntity.ok("User state updated completely");
    }

    @PutMapping("/{user-id}/state/active")
    public ResponseEntity<String> activeUser(@PathVariable("user-id") UUID userId) {
        adminJobService.activeUser(userId);
        return ResponseEntity.ok("User state updated completely");
    }

//    @PutMapping("/{user-id}/role")
//    public ResponseEntity<String> setUserRole(@PathVariable("user-id") UUID userId, @RequestParam("role") String role) {
//        return ResponseEntity.ok("User role updated completely");
//
//    }
}
