package dev.sonle.filmdb.admin.controller;

import dev.sonle.filmdb.shared.internal.UserListInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/admin/users")
public class AdminUserListController {

    private final UserListInterface userListInterface;

//    public AdminUserListController(UserListInterface userListInterface){
//        this.userListInterface = userListInterface;
//    }

    @GetMapping("/all-lists")
    public ResponseEntity<List<UserListInterface.UserListProjection>> getAllUserList(){
        return ResponseEntity.ok(userListInterface.getUserLists());
    }

    @GetMapping("/{userId}/lists")
    public ResponseEntity<List<UserListInterface.UserListProjection>> getUserListsByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(userListInterface.getUserLists(userId));
    }

    @GetMapping("/user-profiles")
    public ResponseEntity<List<UserListInterface.UserProfileProjection>> getAllUserProfiles() {
        return ResponseEntity.ok(userListInterface.getAllUserProfiles());
    }
}
