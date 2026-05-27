package dev.sonle.filmdb.search.listener;

import dev.sonle.filmdb.search.service.SearchRefreshService;
import dev.sonle.filmdb.shared.event.ImdbDataImportedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SearchRefreshListener {

    private final SearchRefreshService searchRefreshService;

    @Async
    @EventListener
    public void handleImdbDataImported(ImdbDataImportedEvent event) {
        log.info("Received ImdbDataImportedEvent for job {}. Triggering async search view refresh...", event.jobId());
        try {
            searchRefreshService.refreshSearch();
        } catch (Exception e) {
            log.error("Async refresh of search materialized view failed for job: {}", event.jobId(), e);
        }
    }
}
