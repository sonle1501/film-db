package dev.sonle.filmdb.users.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_list_details", schema = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserListDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "item_id")
    private UUID itemId;

    @Column(name = "list_id", nullable = false)
    private UUID listId;

    @Column(name = "movie_id", length = 15)
    private String movieId;

    @Column(name = "added_at", updatable = false)
    private OffsetDateTime addedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "state")
    private ItemState state;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", insertable = false, updatable = false, foreignKey = @ForeignKey(name = "fk_user_list_details_user_list"))
    private UserList userList;

    @Builder
    public UserListDetails(UUID listId, String movieId, String notes, ItemState state) {
        this.listId = listId;
        this.movieId = movieId;
        this.state = state;
        this.notes = notes;
    }

    @PrePersist
    protected void onCreate() {
        this.addedAt = OffsetDateTime.now();
    }
}
