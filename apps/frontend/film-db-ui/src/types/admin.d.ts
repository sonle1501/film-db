export interface PendingRequestDto {
  taskId: string;
  initiator: string;
  targetEntityId: string;
  actionType: string;
  state: string;
  description: string;
  priority: number;
  createdAt: string;
}
