package dev.sonle.filmdb.users.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_profile", schema = "users")
@Getter
@Setter
@NoArgsConstructor
//@Builder -> use builder method
//@AllArgsConstructor -> use builder method
 public class UserProfile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_user_profile_user_auth"))
    private UserAuth userAuth;

    @Column(name = "username")
    private String username;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "date_created", updatable = false) //DB update
    private OffsetDateTime dateCreated;

    @Builder
    public UserProfile(UserAuth userAuth, String username, String bio, String displayName) {
        this.userAuth = userAuth;
//        this.userId = userAuth != null ? userAuth.getUserId() : null; // leave the id assignment for JPA handle
        this.username = username;
        this.bio = bio;
        this.displayName = displayName;
    }

    @PrePersist
    protected void calcDateCreated(){
        this.dateCreated = OffsetDateTime.now();
    }

}
