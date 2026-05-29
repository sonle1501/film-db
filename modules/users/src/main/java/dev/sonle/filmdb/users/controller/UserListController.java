package dev.sonle.filmdb.users.controller;

import dev.sonle.filmdb.users.dto.UserListDto;
import dev.sonle.filmdb.users.dto.restdto.*;
import dev.sonle.filmdb.users.service.UserListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.web.bind.annotation.*;

import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;
import dev.sonle.filmdb.users.model.UserAuth;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import dev.sonle.filmdb.shared.annotation.VersionedApi;
import java.util.List;
import java.util.UUID;

@RestController // includes @ResponseBody on all methods
@RequestMapping("/users/lists")
@VersionedApi
@RequiredArgsConstructor
public class UserListController {

    private final UserListService userListService;

//    @PreAuthorize("@listSecurityEvaluator.isOwnerOrPublic(#listID, authentication.principal.userId)")
    @GetMapping("/{list-id}")
    ResponseEntity<UserListDto> getListById(@PathVariable("list-id") UUID listID, @AuthenticationPrincipal UserAuth userAuth) {
        UserListDto userListDto = userListService.getListById(userAuth.getUserId(), listID);
        return ResponseEntity.ok(userListDto);
    }

    @PostMapping("/simple-list")
    ResponseEntity<String> createSimpleList(@RequestParam("nameList") String nameList, @AuthenticationPrincipal UserAuth userAuth) {
        userListService.createList(userAuth.getUserId(),nameList);
        return ResponseEntity.ok("no content");
    }

    @PostMapping("/system-list")
    ResponseEntity<String> createSystemListWithType(@RequestBody IdNameAndTypeDto userRequest, @AuthenticationPrincipal UserAuth userAuth) {
        userListService.createSystemListWithType(userAuth.getUserId(), userRequest.nameList(), userRequest.type());
        return ResponseEntity.ok("no content");
    }

    @PutMapping("/{list-id}/public")
    ResponseEntity<String> setListPublic(@PathVariable("list-id") UUID listId, @AuthenticationPrincipal UserAuth userAuth) {
        userListService.setListPublic(userAuth.getUserId(), listId);
        return ResponseEntity.ok("no content");
    }

    @PatchMapping("")
    ResponseEntity<String> updateUserListMetadata(@RequestBody ListMetadataForPatchUpdateDto userRequest, @AuthenticationPrincipal UserAuth userAuth) {
        userListService.updateUserListMetadata(userRequest, userAuth.getUserId());
        return ResponseEntity.ok("no content");
    }

    @PutMapping("/{list-id}/custom")
    ResponseEntity<String> toggleIsCustomOfList(@PathVariable("list-id") UUID listId, @AuthenticationPrincipal UserAuth userAuth) {
        userListService.toggleIsCustomOfList(userAuth.getUserId(), listId);
        return ResponseEntity.ok("no content");
    }

    @PostMapping
    ResponseEntity<String> createListWithMetadata(@RequestBody ListMetadataForCreateDto userRequest, @AuthenticationPrincipal UserAuth userAuth) {
        userListService.createListWithMetadata(userAuth.getUserId(), userRequest);
        return ResponseEntity.ok("no content");
    }

    @GetMapping
    ResponseEntity<List<UserListDto>> getListsByName(@RequestParam("nameList") String nameList, @AuthenticationPrincipal UserAuth userAuth) {
        List<UserListDto> lists = userListService.getListsByName(userAuth.getUserId(), nameList);
        return ResponseEntity.ok(lists);
    }

    @GetMapping("/all")
    ResponseEntity<List<UserListDto>> getAllUserLists(@AuthenticationPrincipal UserAuth userAuth) {
        List<UserListDto> lists = userListService.getAllUserLists(userAuth.getUserId());
        return ResponseEntity.ok(lists);
    }

    @PreAuthorize("@listSecurityEvaluator.isOwner(#listId, authentication.principal.userId)")
    @DeleteMapping("/{list-id}")
    ResponseEntity<String> deleteListById(@P("listId") @PathVariable("list-id") UUID listId) {
        userListService.removeList(listId);
        return ResponseEntity.ok("no content");
    }

    @PutMapping("/{list-id}/private")
    ResponseEntity<String> setListPrivate(@PathVariable("list-id") UUID listId, @AuthenticationPrincipal UserAuth userAuth) {
        userListService.setListPrivate(userAuth.getUserId(), listId);
        return ResponseEntity.ok("no content");
    }
}