package dev.sonle.filmdb.users.service;

import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;
import dev.sonle.filmdb.users.dto.ListItemDto;
import dev.sonle.filmdb.users.dto.UserListDto;
import dev.sonle.filmdb.users.dto.restdto.ItemMetadataForCreateDto;
import dev.sonle.filmdb.users.dto.restdto.ItemMetadataForPatchUpdateDto;
import dev.sonle.filmdb.users.dto.restdto.ListMetadataForCreateDto;
import dev.sonle.filmdb.users.dto.restdto.ListMetadataForPatchUpdateDto;
import dev.sonle.filmdb.users.model.ItemState;
import dev.sonle.filmdb.users.model.ListType;
import dev.sonle.filmdb.users.model.UserList;
import dev.sonle.filmdb.users.model.UserListDetails;
import dev.sonle.filmdb.users.repository.UserListDetailsRepository;
import dev.sonle.filmdb.users.repository.UserListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserListDetailsService {

    private final UserListRepository userListRepository;
    private final UserListDetailsRepository userListDetailsRepository;

    @Transactional
    public UserListDto getListById(UUID userId, UUID listID){
        UserList userList = userListRepository.findByUserIdAndListId(userId, listID).orElseThrow(()-> new BusinessException(BusinessExceptionCode.INVALID_INPUT));
        return UserListDto.from(userList);
    }
    @Transactional
    public ListItemDto getItemById(UUID userId, UUID listId, UUID itemId){
        boolean isExist = userListDetailsRepository.existByUserIdAndUserListIdAndItemId(userId, listId, itemId);
        if (!isExist){
            throw new BusinessException(BusinessExceptionCode.ITEM_ALREADY_EXISTS);
        }
        UserListDetails userListDetails = userListDetailsRepository.findById(itemId).orElseThrow(()-> new BusinessException(BusinessExceptionCode.INVALID_INPUT));
        return ListItemDto.from(userListDetails);
    }

    @Transactional
    public void createItem(UUID userId, UUID listId, ItemMetadataForCreateDto itemMetadata){
        UserList userList = userListRepository.findByUserIdAndListId(userId,listId).orElseThrow(() -> new BusinessException(BusinessExceptionCode.INVALID_INPUT));
        ItemState itemState = ItemState.fromString(itemMetadata.state());
        boolean isValidState = stateLogicCheckingHelper(itemState, userList.getListType());
        if (!isValidState) throw new BusinessException(BusinessExceptionCode.ITEM_NOT_VALID);

        UserListDetails item = UserListDetails.builder()
                .listId(listId)
                .movieId(itemMetadata.movieId())
                .state(itemState)
                .notes(itemMetadata.notes())
                .build();
        userListDetailsRepository.save(item);
    }

    @Transactional
    public void removeListItem(UUID userId, UUID listId, UUID itemId) {
        boolean isExist = userListDetailsRepository.existByUserIdAndUserListIdAndItemId(userId, listId, itemId);
        if (!isExist) {
            throw new BusinessException(BusinessExceptionCode.UNAUTHORIZED_ACCESS);
        }
        userListDetailsRepository.deleteById(itemId);
    }

    @Transactional
    public void updateMetadataListItem(UUID userId, UUID listId, ItemMetadataForPatchUpdateDto patchDto) {
        boolean isExist = userListDetailsRepository.existByUserIdAndUserListIdAndItemId(userId, listId, patchDto.itemId());
        if (!isExist) {
            throw new BusinessException(BusinessExceptionCode.UNAUTHORIZED_ACCESS);
        }
        UserListDetails item = userListDetailsRepository.findById(patchDto.itemId()).orElseThrow(() -> new BusinessException(BusinessExceptionCode.INVALID_INPUT));


        if (patchDto.state() != null && !patchDto.state().isBlank()) {
            UserList userList = userListRepository.findByUserIdAndListId(userId,listId).orElseThrow(() -> new BusinessException(BusinessExceptionCode.INVALID_INPUT));
            ItemState itemState = ItemState.fromString(patchDto.state());
            boolean isValidState = stateLogicCheckingHelper(itemState, userList.getListType());
            if (!isValidState) throw new BusinessException(BusinessExceptionCode.INVALID_INPUT);
            item.setState(itemState);
        }
        if (patchDto.notes() != null) {
            item.setNotes(patchDto.notes());
        }
        userListDetailsRepository.save(item);
    }

    private boolean stateLogicCheckingHelper(ItemState itemState, ListType listType){
        if (ListType.MIXTURE == listType){
            return true;
        }
        if (itemState.name().equals(listType.name())){
            return true;
        }
        return false;
    }
}
