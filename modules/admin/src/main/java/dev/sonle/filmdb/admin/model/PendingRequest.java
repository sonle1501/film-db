package dev.sonle.filmdb.admin.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pending_request", schema = "admin")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingRequest {

    @Id
    @Column(name = "task_id", nullable = false)
    private UUID taskId;

    @Column(name = "initiator")
    private UUID initiator;

    @Column(name = "target_entity_id", length = 50)
    private String targetEntityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", length = 50)
    private AdminActionType actionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "state", length = 50)
    private PendingRequestState state;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "priority", length = 50)
    private Integer priority;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
