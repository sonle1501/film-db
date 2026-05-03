package dev.sonle.filmdb.users.repository;

import dev.sonle.filmdb.users.model.UserListDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserListDetailsRepository extends JpaRepository<UserListDetails, UUID> {
    @Query("""
        SELECT CASE WHEN COUNT(ud) > 0 THEN true ELSE false END 
        FROM UserListDetails ud
        JOIN UserList ul ON ud.listId = ul.listId 
        WHERE ud.itemId = :itemId 
          AND ud.listId = :listId 
          AND ul.userId = :userId
    """)
    boolean existByUserIdAndUserListIdAndItemId(UUID userId, UUID listId, UUID itemId);


}
