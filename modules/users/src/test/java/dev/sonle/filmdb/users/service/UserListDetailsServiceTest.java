package dev.sonle.filmdb.users.service;

import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;
import dev.sonle.filmdb.users.dto.ListItemDto;
import dev.sonle.filmdb.users.dto.UserListDto;
import dev.sonle.filmdb.users.dto.restdto.ItemMetadataForCreateDto;
import dev.sonle.filmdb.users.dto.restdto.ItemMetadataForPatchUpdateDto;
import dev.sonle.filmdb.users.model.ItemState;
import dev.sonle.filmdb.users.model.ListType;
import dev.sonle.filmdb.users.model.UserList;
import dev.sonle.filmdb.users.model.UserListDetails;
import dev.sonle.filmdb.users.repository.UserListDetailsRepository;
import dev.sonle.filmdb.users.repository.UserListRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserListDetailsServiceTest {

    @Mock
    private UserListRepository userListRepository;

    @Mock
    private UserListDetailsRepository userListDetailsRepository;

    private UserListDetailsService userListDetailsService;

    private UUID userId;
    private UUID listId;
    private UUID itemId;
    private UserList userList;
    private UserListDetails userListDetails;

    @BeforeEach
    void setUp() {
        userListDetailsService = new UserListDetailsService(userListRepository, userListDetailsRepository);

        userId = UUID.randomUUID();
        listId = UUID.randomUUID();
        itemId = UUID.randomUUID();

        userList = UserList.builder()
                .userId(userId)
                .nameList("Watching List")
                .listType(ListType.WATCHING)
                .isCustom(true)
                .isPublic(false)
                .build();
        userList.setListId(listId);

        userListDetails = UserListDetails.builder()
                .listId(listId)
                .movieId("tt1234567")
                .notes("Original Notes")
                .state(ItemState.WATCHING)
                .build();
        userListDetails.setItemId(itemId);
        userListDetails.setAddedAt(OffsetDateTime.now()); // setup date
    }

    @Test
    void shouldGetListById() {
        when(userListRepository.findByUserIdAndListId(userId, listId)).thenReturn(Optional.of(userList));

        UserListDto result = userListDetailsService.getListById(userId, listId);

        assertNotNull(result);
        assertEquals(listId, result.listId());
    }

    @Test
    void shouldGetItemByIdSuccessfully() {
        when(userListDetailsRepository.existByUserIdAndUserListIdAndItemId(userId, listId, itemId)).thenReturn(true);
        when(userListDetailsRepository.findById(itemId)).thenReturn(Optional.of(userListDetails));

        ListItemDto result = userListDetailsService.getItemById(userId, listId, itemId);

        assertNotNull(result);
        assertEquals(itemId, result.itemId());
        assertEquals("tt1234567", result.movieId());
    }

    @Test
    void shouldThrowExceptionWhenGetItemByIdNotExists() {
        when(userListDetailsRepository.existByUserIdAndUserListIdAndItemId(userId, listId, itemId)).thenReturn(false);

        BusinessException exception = assertThrows(BusinessException.class, () ->
                userListDetailsService.getItemById(userId, listId, itemId)
        );

        assertEquals(BusinessExceptionCode.ITEM_ALREADY_EXISTS, exception.getBusinessExceptionCode());
    }

    @Test
    void shouldGetAllItemsInList() {
        when(userListRepository.findByUserIdAndListId(userId, listId)).thenReturn(Optional.of(userList));
        when(userListDetailsRepository.findAllByUserIdAndListId(userId, listId)).thenReturn(List.of(userListDetails));

        List<ListItemDto> result = userListDetailsService.getAllItems(userId, listId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(itemId, result.get(0).itemId());
    }

    @Test
    void shouldCreateItemSuccessfullyWhenStateMatchesListType() {
        ItemMetadataForCreateDto itemDto = new ItemMetadataForCreateDto("tt1234567", "WATCHING", "Note");
        when(userListRepository.findByUserIdAndListId(userId, listId)).thenReturn(Optional.of(userList)); // listType = WATCHING

        userListDetailsService.createItem(userId, listId, itemDto);

        ArgumentCaptor<UserListDetails> itemCaptor = ArgumentCaptor.forClass(UserListDetails.class);
        verify(userListDetailsRepository, times(1)).save(itemCaptor.capture());

        UserListDetails savedItem = itemCaptor.getValue();
        assertEquals(listId, savedItem.getListId());
        assertEquals("tt1234567", savedItem.getMovieId());
        assertEquals(ItemState.WATCHING, savedItem.getState());
        assertEquals("Note", savedItem.getNotes());
    }

    @Test
    void shouldCreateItemSuccessfullyForMixtureListType() {
        userList.setListType(ListType.MIXTURE);
        ItemMetadataForCreateDto itemDto = new ItemMetadataForCreateDto("tt1234567", "PLAN_TO_WATCH", "Note");
        when(userListRepository.findByUserIdAndListId(userId, listId)).thenReturn(Optional.of(userList));

        userListDetailsService.createItem(userId, listId, itemDto);

        verify(userListDetailsRepository, times(1)).save(any(UserListDetails.class));
    }

    @Test
    void shouldThrowExceptionWhenCreateItemStateDoesNotMatchListType() {
        ItemMetadataForCreateDto itemDto = new ItemMetadataForCreateDto("tt1234567", "PLAN_TO_WATCH", "Note");
        when(userListRepository.findByUserIdAndListId(userId, listId)).thenReturn(Optional.of(userList)); // listType = WATCHING

        BusinessException exception = assertThrows(BusinessException.class, () ->
                userListDetailsService.createItem(userId, listId, itemDto)
        );

        assertEquals(BusinessExceptionCode.ITEM_NOT_VALID, exception.getBusinessExceptionCode());
        verify(userListDetailsRepository, never()).save(any());
    }

    @Test
    void shouldRemoveListItemSuccessfully() {
        when(userListDetailsRepository.existByUserIdAndUserListIdAndItemId(userId, listId, itemId)).thenReturn(true);

        userListDetailsService.removeListItem(userId, listId, itemId);

        verify(userListDetailsRepository, times(1)).deleteById(itemId);
    }

    @Test
    void shouldThrowExceptionWhenRemoveListItemUnauthorized() {
        when(userListDetailsRepository.existByUserIdAndUserListIdAndItemId(userId, listId, itemId)).thenReturn(false);

        BusinessException exception = assertThrows(BusinessException.class, () ->
                userListDetailsService.removeListItem(userId, listId, itemId)
        );

        assertEquals(BusinessExceptionCode.UNAUTHORIZED_ACCESS, exception.getBusinessExceptionCode());
        verify(userListDetailsRepository, never()).deleteById(any());
    }

    @Test
    void shouldUpdateMetadataListItemSuccessfully() {
        ItemMetadataForPatchUpdateDto patchDto = new ItemMetadataForPatchUpdateDto(itemId, "WATCHING", "Updated Notes");
        when(userListDetailsRepository.existByUserIdAndUserListIdAndItemId(userId, listId, itemId)).thenReturn(true);
        when(userListDetailsRepository.findById(itemId)).thenReturn(Optional.of(userListDetails));
        when(userListRepository.findByUserIdAndListId(userId, listId)).thenReturn(Optional.of(userList)); // listType = WATCHING

        userListDetailsService.updateMetadataListItem(userId, listId, patchDto);

        assertEquals(ItemState.WATCHING, userListDetails.getState());
        assertEquals("Updated Notes", userListDetails.getNotes());
        verify(userListDetailsRepository, times(1)).save(userListDetails);
    }

    @Test
    void shouldThrowExceptionWhenUpdateMetadataListItemUnauthorized() {
        ItemMetadataForPatchUpdateDto patchDto = new ItemMetadataForPatchUpdateDto(itemId, "WATCHING", "Updated Notes");
        when(userListDetailsRepository.existByUserIdAndUserListIdAndItemId(userId, listId, itemId)).thenReturn(false);

        BusinessException exception = assertThrows(BusinessException.class, () ->
                userListDetailsService.updateMetadataListItem(userId, listId, patchDto)
        );

        assertEquals(BusinessExceptionCode.UNAUTHORIZED_ACCESS, exception.getBusinessExceptionCode());
    }
}
