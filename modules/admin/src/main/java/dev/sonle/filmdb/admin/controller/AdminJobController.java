package dev.sonle.filmdb.admin.controller;

import dev.sonle.filmdb.admin.service.AdminJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/admin/job")
public class AdminJobController {

    private final AdminJobService adminJobService;

    @GetMapping("/pending-tasks")
    public ResponseEntity<java.util.List<dev.sonle.filmdb.admin.dto.PendingRequestDto>> getPendingTasks() {
        return ResponseEntity.ok(adminJobService.getPendingRequestList());
    }

    @PostMapping("/approve-admin")
    public ResponseEntity<String> approveAdmin(@RequestParam("userId") UUID userId) {
        adminJobService.approveAdminRequest(userId);
        return ResponseEntity.ok("Approve the admin request from user: " + userId +  " completely");
    }

    @PostMapping("/reject-admin")
    public ResponseEntity<String> rejectAdmin(@RequestParam("userId") UUID userId) {
        adminJobService.rejectAdminRequest(userId);
        return ResponseEntity.ok("Reject the admin request from user: " + userId +  " completely");
    }

}
