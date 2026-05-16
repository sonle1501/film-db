package dev.sonle.filmdb.admin.dto;

import dev.sonle.filmdb.admin.model.AdminActionType;
import dev.sonle.filmdb.admin.model.PendingRequestState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingRequestDto {
    private UUID taskId;
    private UUID initiator;
    private String targetEntityId;
    private AdminActionType actionType;
    private PendingRequestState state;
    private String description;
    private Integer priority;
    private OffsetDateTime createdAt;
}
