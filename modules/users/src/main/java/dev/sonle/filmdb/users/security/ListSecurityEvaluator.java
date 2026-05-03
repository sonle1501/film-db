package dev.sonle.filmdb.users.security;

import dev.sonle.filmdb.users.dto.UserListDto;
import dev.sonle.filmdb.users.repository.UserListRepository;
import dev.sonle.filmdb.users.service.UserListService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("listSecurityEvaluator")
@RequiredArgsConstructor
public class ListSecurityEvaluator {

    private final UserListService userListService;
    private final UserListRepository userListRepository;

    public boolean isOwner(UUID listId, UUID userId) {
        boolean isExist = userListRepository.existsByUserIdAndListId(userId, listId);
        return isExist;
    }

}
