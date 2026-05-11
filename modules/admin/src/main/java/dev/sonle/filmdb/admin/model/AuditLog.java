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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "audit_log", schema = "admin")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @Column(name = "log_id", nullable = false)
    private UUID logId;

    @Column(name = "admin_id", nullable = false)
    private UUID adminId;

    @Column(name = "target_user_id")
    private UUID targetUserId;

    @Column(name = "target_entity_id", length = 50)
    private String targetEntityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", length = 50, nullable = false)
    private AdminActionType actionType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "action_payload", columnDefinition = "jsonb")
    private Map<String, Object> actionPayload;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
