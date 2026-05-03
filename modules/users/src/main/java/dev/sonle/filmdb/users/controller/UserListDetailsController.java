package dev.sonle.filmdb.users.controller;

import dev.sonle.filmdb.users.dto.ListItemDto;
import dev.sonle.filmdb.users.dto.restdto.ItemMetadataForCreateDto;
import dev.sonle.filmdb.users.dto.restdto.ItemMetadataForPatchUpdateDto;
import dev.sonle.filmdb.users.model.UserAuth;
import dev.sonle.filmdb.users.model.UserListDetails;
import dev.sonle.filmdb.users.service.UserListDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("api/v1/users/lists")
@RequiredArgsConstructor
public class UserListDetailsController {
    private final UserListDetailsService userListDetailsService;

    @GetMapping("/{list-id}/items")
    public ResponseEntity<ListItemDto> getListItem(@PathVariable("list-id") UUID listId, @RequestParam("item-id") UUID itemId, @AuthenticationPrincipal UserAuth userAuth){
        ListItemDto listItemDto = userListDetailsService.getItemById(userAuth.getUserId(), listId, itemId);
        return ResponseEntity.ok(listItemDto);
    }

    @PostMapping("/{list-id}/items")
    public ResponseEntity<String> addListItem(@PathVariable("list-id") UUID listId, @RequestBody ItemMetadataForCreateDto userRequest, @AuthenticationPrincipal UserAuth userAuth){
        userListDetailsService.createItem(userAuth.getUserId(), listId, userRequest);
        return ResponseEntity.ok("no-content");
    }

    @DeleteMapping("/{list-id}/items")
    public ResponseEntity<String> removeListItem(@PathVariable("list-id") UUID listId, @RequestParam("item-id") UUID itemId,  @AuthenticationPrincipal UserAuth userAuth){
        userListDetailsService.removeListItem(userAuth.getUserId(), listId, itemId);
        return ResponseEntity.ok("no-content");
    }

    @PatchMapping("/{list-id}/items")
    public ResponseEntity<String> updateMetadataListItem(@PathVariable("list-id") UUID listId, @RequestBody ItemMetadataForPatchUpdateDto userRequest, @AuthenticationPrincipal UserAuth userAuth){
        userListDetailsService.updateMetadataListItem(userAuth.getUserId(), listId, userRequest);
        return ResponseEntity.ok("no-content");
    }
}
