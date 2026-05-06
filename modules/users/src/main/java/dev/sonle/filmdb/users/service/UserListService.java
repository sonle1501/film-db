package dev.sonle.filmdb.users.service;

import dev.sonle.filmdb.shared.exception.BusinessException;
import dev.sonle.filmdb.shared.exception.BusinessExceptionCode;
import dev.sonle.filmdb.users.dto.UserListDto;
import dev.sonle.filmdb.users.dto.restdto.ListMetadataForPatchUpdateDto;
import dev.sonle.filmdb.users.model.ListType;
import dev.sonle.filmdb.users.model.UserList;
import dev.sonle.filmdb.users.repository.UserListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import dev.sonle.filmdb.users.dto.restdto.ListMetadataForCreateDto;

@Service
@RequiredArgsConstructor
public class UserListService {

    private final UserListRepository userListRepository;

    @Transactional
    public UserListDto getListById(UUID userId, UUID listID){
        UserList userList = userListRepository.findByUserIdAndListId(userId, listID)
                .orElseThrow(
                        ()-> new BusinessException(BusinessExceptionCode.LIST_NOT_FOUND, "Cannot found list with ID: " + listID));
        return UserListDto.from(userList);
    }

    @Transactional
    public void createList(UUID userId, String nameList){
        boolean isExist = userListRepository.existsByUserIdAndNameListAndListType(userId, nameList, ListType.MIXTURE);

        if (isExist) throw new BusinessException(BusinessExceptionCode.LIST_ALREADY_EXISTS,
                          String.format("List with Name %s and Type %s is already exist", nameList, ListType.MIXTURE.toString()));

        UserList userList = UserList.builder()
                .nameList(nameList)
                .userId(userId)
                .listType(ListType.MIXTURE)
                .isCustom(true)
                .isPublic(false)
                .build();
        userListRepository.save(userList);
    }

    @Transactional
    public void createListWithType(UUID userId, String nameList, String type){
        ListType listType = ListType.fromString(type);
        boolean isExist = userListRepository.existsByUserIdAndNameListAndListType(userId, nameList, listType);

        if (!isExist) throw new BusinessException(BusinessExceptionCode.LIST_ALREADY_EXISTS,
                String.format("List with Name: %s and Type: %s is already exist", nameList, type));


        UserList userList = UserList.builder()
                .nameList(nameList)
                .userId(userId)
                .listType(ListType.MIXTURE)
                .isCustom(true)
                .isPublic(false)
                .build();

        userListRepository.save(userList);
    }

    @Transactional
    public void createSystemListWithType(UUID userId, String nameList, String type){
        ListType listType = ListType.fromString(type);
        boolean isExist = userListRepository.existsByUserIdAndNameListAndListType(userId, nameList, listType);

        if (isExist) throw new BusinessException(BusinessExceptionCode.LIST_ALREADY_EXISTS,
                String.format("List with Name: %s and Type: %s is already exist", nameList, type));

        UserList userList = UserList.builder()
                .nameList(nameList)
                .userId(userId)
                .listType(listType)
                .isCustom(false)
                .isPublic(false)
                .build();

        userListRepository.save(userList);
    }

    @Transactional
    public void setListPublic(UUID userId, UUID listID){
        UserList userList = userListRepository.findByUserIdAndListId(userId, listID)
                .orElseThrow(()-> new BusinessException(BusinessExceptionCode.UNAUTHORIZED_ACCESS));
        userList.setIsPublic(true);
        userListRepository.save(userList);
    }

    @Transactional
    public void setListPrivate(UUID userId, UUID listID){
        UserList userList = userListRepository.findByUserIdAndListId(userId, listID)
                .orElseThrow(()-> new BusinessException(BusinessExceptionCode.UNAUTHORIZED_ACCESS));
        userList.setIsPublic(false);
        userListRepository.save(userList);
    }

    @Transactional
    public void toggleIsCustomOfList(UUID userId, UUID listID){
        UserList userList = userListRepository.findByUserIdAndListId(userId, listID)
                .orElseThrow(()-> new BusinessException(BusinessExceptionCode.UNAUTHORIZED_ACCESS));
        userList.setIsCustom(!userList.getIsCustom());
        userListRepository.save(userList);
    }


    @Transactional
    public void updateUserListMetadata(ListMetadataForPatchUpdateDto patchDto){
        UserList userList = userListRepository.findById(patchDto.listId())
                .orElseThrow(()-> new BusinessException(BusinessExceptionCode.INVALID_INPUT, "Invalid field or value, cannot updated list"));

        if (patchDto.nameList() != null && !patchDto.nameList().isBlank()){
            userList.setNameList(patchDto.nameList());
        }

        if (patchDto.isPublic() != null) {
            userList.setIsPublic(patchDto.isPublic());
        }

        if (patchDto.isCustom() != null) {
            userList.setIsCustom(patchDto.isCustom());
        }

        userListRepository.save(userList);
    }

    @Transactional
    public void removeList(UUID listId){
        userListRepository.deleteById(listId);
    }

    @Transactional
    public void createListWithMetadata(UUID userId, ListMetadataForCreateDto request) {
        ListType listType = ListType.fromString(request.type());
        boolean isExist = userListRepository.existsByUserIdAndNameListAndListType(userId, request.nameList(), listType);

        if (isExist) throw new BusinessException(BusinessExceptionCode.LIST_ALREADY_EXISTS);

        UserList userList = UserList.builder()
                .nameList(request.nameList())
                .userId(userId)
                .listType(listType)
                .isCustom(true)
                .isPublic(request.isPublic() != null ? request.isPublic() : false)
                .build();

        userListRepository.save(userList);
    }

    @Transactional(readOnly = true)
    public List<UserListDto> getListsByName(UUID userId, String nameList) {
        List<UserList> lists = userListRepository.findByUserIdAndNameList(userId, nameList);
        return lists.stream()
                .map(UserListDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserListDto> getAllUserLists(UUID userId) {
        List<UserList> lists = userListRepository.findByUserId(userId);
        return lists.stream()
                .map(UserListDto::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserListDto> getAllUserList() {
        List<UserList> lists = userListRepository.findAll();
        return lists.stream()
                .map(UserListDto::from)
                .collect(Collectors.toList());
    }

}
