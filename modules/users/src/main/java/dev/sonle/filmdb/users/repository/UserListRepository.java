package dev.sonle.filmdb.users.repository;

import dev.sonle.filmdb.users.model.ListType;
import dev.sonle.filmdb.users.model.UserList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserListRepository extends JpaRepository<UserList, UUID> {
    boolean existsByUserIdAndNameListAndListType(UUID userId, String nameList, ListType listType);
    boolean existsByUserIdAndListId(UUID userId, UUID listId);
    List<UserList> findByUserIdAndNameList(UUID userId, String nameList);
    Optional<UserList> findByUserIdAndListId(UUID userId, UUID listId);
    List<UserList> findByUserId(UUID userId);

//    @Query("UPDATE UserList u SET u.isPublic = true WHERE u.listId = :listID")
//    void setListPublic(UUID listID);
//
//    @Query("UPDATE UserList u SET u.isCustom = NOT (u.isCustom) WHERE u.listId = :listID")
//    void toggleIsCustom(UUID listID);
}
