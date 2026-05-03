package dev.sonle.filmdb.users.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_list", schema = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserList {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "list_id")
    private UUID listId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "name_list", nullable = false, length = 100)
    private String nameList;

    @Column(name = "list_type")
    @Enumerated(EnumType.STRING)
    private ListType listType;

    @Column(name = "is_custom")
    private Boolean isCustom;

    @Column(name = "is_public")
    private Boolean isPublic;

    @Column(name = "date_created", updatable = false) //DB update
    private OffsetDateTime dateCreated;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false, foreignKey = @ForeignKey(ConstraintMode.NO_CONSTRAINT))
    private UserAuth userAuth;

    @Builder
    public UserList(UUID userId, String nameList,  ListType listType, Boolean isCustom, Boolean isPublic) {
        this.userId = userId;
        this.nameList = nameList;
        this.listType = listType;
        this.isCustom = isCustom;
        this.isPublic = isPublic;
    }

    @PrePersist
    protected void onCreate() {
        this.dateCreated = OffsetDateTime.now();
    }
}
