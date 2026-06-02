package dev.sonle.filmdb.users.service;

import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;
import dev.sonle.filmdb.users.dto.UserListDto;
import dev.sonle.filmdb.users.dto.restdto.ListMetadataForCreateDto;
import dev.sonle.filmdb.users.dto.restdto.ListMetadataForPatchUpdateDto;
import dev.sonle.filmdb.users.model.ListType;
import dev.sonle.filmdb.users.model.UserList;
import dev.sonle.filmdb.users.repository.UserListRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserListServiceTest {

    @Mock
    private UserListRepository userListRepository;

    private UserListService userListService;

    private UUID userId;
    private UUID listId;
    private UserList userList;

    @BeforeEach
    void setUp() {
        userListService = new UserListService(userListRepository);

        userId = UUID.randomUUID();
        listId = UUID.randomUUID();
        userList = UserList.builder()
                .userId(userId)
                .nameList("Favorite Movies")
                .listType(ListType.MIXTURE)
                .isCustom(true)
                .isPublic(false)
                .build();
        userList.setListId(listId);
    }

    @Test
    void shouldGetListByIdSuccessfully() {
        when(userListRepository.findByUserIdAndListId(userId, listId)).thenReturn(Optional.of(userList));

        UserListDto result = userListService.getListById(userId, listId);

        assertNotNull(result);
        assertEquals(listId, result.listId());
        assertEquals("Favorite Movies", result.nameList());
    }

    @Test
    void shouldThrowExceptionWhenGetListByIdNotFound() {
        when(userListRepository.findByUserIdAndListId(userId, listId)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () ->
                userListService.getListById(userId, listId)
        );

        assertEquals(BusinessExceptionCode.LIST_NOT_FOUND, exception.getBusinessExceptionCode());
    }

    @Test
    void shouldCreateListSuccessfully() {
        when(userListRepository.existsByUserIdAndNameListAndListType(userId, "My Custom List", ListType.MIXTURE))
                .thenReturn(false);

        userListService.createList(userId, "My Custom List");

        ArgumentCaptor<UserList> listCaptor = ArgumentCaptor.forClass(UserList.class);
        verify(userListRepository, times(1)).save(listCaptor.capture());

        UserList savedList = listCaptor.getValue();
        assertEquals("My Custom List", savedList.getNameList());
        assertEquals(userId, savedList.getUserId());
        assertEquals(ListType.MIXTURE, savedList.getListType());
        assertTrue(savedList.getIsCustom());
        assertFalse(savedList.getIsPublic());
    }

    @Test
    void shouldThrowExceptionWhenCreateListAlreadyExists() {
        when(userListRepository.existsByUserIdAndNameListAndListType(userId, "Favorite Movies", ListType.MIXTURE))
                .thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () ->
                userListService.createList(userId, "Favorite Movies")
        );

        assertEquals(BusinessExceptionCode.LIST_ALREADY_EXISTS, exception.getBusinessExceptionCode());
        verify(userListRepository, never()).save(any());
    }

    @Test
    void shouldCreateListWithTypeSuccessfully() {
        // Source logic: if (!isExist) throw exception.
        // Thus, we must mock existsByUserIdAndNameListAndListType to return true for it to succeed.
        when(userListRepository.existsByUserIdAndNameListAndListType(userId, "Action List", ListType.WATCHING))
                .thenReturn(true);

        userListService.createListWithType(userId, "Action List", "WATCHING");

        verify(userListRepository, times(1)).save(any(UserList.class));
    }

    @Test
    void shouldThrowExceptionWhenCreateListWithTypeDoesNotExist() {
        // If isExist is false, the service logic throws LIST_ALREADY_EXISTS.
        when(userListRepository.existsByUserIdAndNameListAndListType(userId, "Action List", ListType.WATCHING))
                .thenReturn(false);

        assertThrows(BusinessException.class, () ->
                userListService.createListWithType(userId, "Action List", "WATCHING")
        );

        verify(userListRepository, never()).save(any());
    }

    @Test
    void shouldCreateSystemListWithTypeSuccessfully() {
        when(userListRepository.existsByUserIdAndNameListAndListType(userId, "System List", ListType.WATCHED))
                .thenReturn(false);

        userListService.createSystemListWithType(userId, "System List", "WATCHED");

        ArgumentCaptor<UserList> listCaptor = ArgumentCaptor.forClass(UserList.class);
        verify(userListRepository, times(1)).save(listCaptor.capture());

        UserList savedList = listCaptor.getValue();
        assertEquals("System List", savedList.getNameList());
        assertFalse(savedList.getIsCustom()); // System lists are not custom
    }

    @Test
    void shouldSetListPublicSuccessfully() {
        when(userListRepository.findByUserIdAndListId(userId, listId)).thenReturn(Optional.of(userList));

        userListService.setListPublic(userId, listId);

        assertTrue(userList.getIsPublic());
        verify(userListRepository, times(1)).save(userList);
    }

    @Test
    void shouldSetListPrivateSuccessfully() {
        userList.setIsPublic(true);
        when(userListRepository.findByUserIdAndListId(userId, listId)).thenReturn(Optional.of(userList));

        userListService.setListPrivate(userId, listId);

        assertFalse(userList.getIsPublic());
        verify(userListRepository, times(1)).save(userList);
    }

    @Test
    void shouldToggleIsCustomOfListSuccessfully() {
        assertTrue(userList.getIsCustom());
        when(userListRepository.findByUserIdAndListId(userId, listId)).thenReturn(Optional.of(userList));

        userListService.toggleIsCustomOfList(userId, listId);
        assertFalse(userList.getIsCustom());

        userListService.toggleIsCustomOfList(userId, listId);
        assertTrue(userList.getIsCustom());

        verify(userListRepository, times(2)).save(userList);
    }

    @Test
    void shouldUpdateUserListMetadataSuccessfully() {
        ListMetadataForPatchUpdateDto patchDto = new ListMetadataForPatchUpdateDto(userId, listId, "New Name", true, false, ListType.MIXTURE);
        when(userListRepository.findByUserIdAndListId(userId, listId)).thenReturn(Optional.of(userList));

        userListService.updateUserListMetadata(patchDto, userId);

        assertEquals("New Name", userList.getNameList());
        assertTrue(userList.getIsPublic());
        assertFalse(userList.getIsCustom());
        verify(userListRepository, times(1)).save(userList);
    }

    @Test
    void shouldRemoveListSuccessfully() {
        userListService.removeList(listId);
        verify(userListRepository, times(1)).deleteById(listId);
    }

    @Test
    void shouldCreateListWithMetadataSuccessfully() {
        ListMetadataForCreateDto request = new ListMetadataForCreateDto("Metadata List", "MIXTURE", true);
        when(userListRepository.existsByUserIdAndNameListAndListType(userId, "Metadata List", ListType.MIXTURE))
                .thenReturn(false);

        userListService.createListWithMetadata(userId, request);

        verify(userListRepository, times(1)).save(any(UserList.class));
    }

    @Test
    void shouldGetListsByName() {
        when(userListRepository.findByUserIdAndNameList(userId, "Favorite Movies")).thenReturn(List.of(userList));

        List<UserListDto> result = userListService.getListsByName(userId, "Favorite Movies");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Favorite Movies", result.get(0).nameList());
    }

    @Test
    void shouldGetAllUserListsForUser() {
        when(userListRepository.findByUserId(userId)).thenReturn(List.of(userList));

        List<UserListDto> result = userListService.getAllUserLists(userId);

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    @Test
    void shouldGetAllUserListsGlobally() {
        when(userListRepository.findAll()).thenReturn(List.of(userList));

        List<UserListDto> result = userListService.getAllUserList();

        assertNotNull(result);
        assertEquals(1, result.size());
    }
}
