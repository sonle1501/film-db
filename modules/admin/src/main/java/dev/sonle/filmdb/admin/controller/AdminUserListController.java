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
@RequestMapping("api/admin/userlist")
public class AdminUserListController {

    private final UserListInterface userListInterface;


    @GetMapping("/all-lists")
    public ResponseEntity<List<UserListInterface.UserListProjection>> getAllUserList(){
        return ResponseEntity.ok(userListInterface.getUserLists());
    }

    @GetMapping("/{user-id}/lists")
    public ResponseEntity<List<UserListInterface.UserListProjection>> getUserListsByUserId(@PathVariable("user-id") UUID userId) {
        return ResponseEntity.ok(userListInterface.getUserLists(userId));
    }
}
