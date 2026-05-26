package dev.sonle.filmdb.importer.pipeline;

import dev.sonle.filmdb.importer.service.ImdbImportService;
import dev.sonle.filmdb.shared.event.ImportProgressEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImdbImportPipeline {

    private final ImdbImportService imdbImportService;
    private final ApplicationEventPublisher eventPublisher;

    public void runImportPipeline(String baseDir, UUID jobId) {
        log.info("Starting Import Pipeline...");

        ConcurrentHashMap<String, Double> progressMap = new ConcurrentHashMap<>();
        String[] taskNames = {"Movie", "Person", "Alternative", "Crew", "Episode", "Principal", "Rating"};
        for (String task : taskNames) {
            progressMap.put(task, 0.0);
        }

        executeImportedTasks(baseDir, jobId, progressMap);

        eventPublisher.publishEvent(ImportProgressEvent.progress(
                jobId, "IMPORTING", 90.0, "All parallel import tasks completed successfully."));
        log.info("Import Pipeline finished");
    }


    private void executeImportedTasks(String baseDir, UUID jobId, ConcurrentHashMap<String, Double> progressMap) {
        log.info("Starting parallel import tasks...");

        String moviePath = baseDir + DatasetInfo.MOVIE.getFileName();
        String personPath = baseDir + DatasetInfo.PERSON.getFileName();
        String alternativePath = baseDir + DatasetInfo.ALTERNATIVE.getFileName();
        String crewPath = baseDir + DatasetInfo.CREW.getFileName();
        String episodePath = baseDir + DatasetInfo.EPISODE.getFileName();
        String principalPath = baseDir + DatasetInfo.PRINCIPAL.getFileName();
        String ratingPath = baseDir + DatasetInfo.RATING.getFileName();

        int nTasks = 7;
        ExecutorService executor = Executors.newFixedThreadPool(nTasks);

        try {
            CompletableFuture<Void> movieTask = CompletableFuture.runAsync(() -> imdbImportService.importMovies(moviePath, p -> reportProgress(jobId, "Movie", p, progressMap)), executor);
            CompletableFuture<Void> personTask = CompletableFuture.runAsync(() -> imdbImportService.importPersons(personPath, p -> reportProgress(jobId, "Person", p, progressMap)), executor);
            CompletableFuture<Void> alternativeTask = CompletableFuture.runAsync(() -> imdbImportService.importMovieAlternatives(alternativePath, p -> reportProgress(jobId, "Alternative", p, progressMap)), executor);
            CompletableFuture<Void> crewTask = CompletableFuture.runAsync(() -> imdbImportService.importMovieCrews(crewPath, p -> reportProgress(jobId, "Crew", p, progressMap)), executor);
            CompletableFuture<Void> episodeTask = CompletableFuture.runAsync(() -> imdbImportService.importMovieEpisodes(episodePath, p -> reportProgress(jobId, "Episode", p, progressMap)), executor);
            CompletableFuture<Void> principalTask = CompletableFuture.runAsync(() -> imdbImportService.importMoviePrincipals(principalPath, p -> reportProgress(jobId, "Principal", p, progressMap)), executor);
            CompletableFuture<Void> ratingTask = CompletableFuture.runAsync(() -> imdbImportService.importMovieRatings(ratingPath, p -> reportProgress(jobId, "Rating", p, progressMap)), executor);

            CompletableFuture.allOf(
                    movieTask, personTask, alternativeTask,
                    crewTask, episodeTask, principalTask, ratingTask
            ).join();

            log.info("All parallel imported tasks completed.");
        } finally {
            executor.shutdown();
        }
    }

    private void reportProgress(UUID jobId, String taskName, double progress, ConcurrentHashMap<String, Double> progressMap) {
        progressMap.put(taskName, progress);

        double totalImportProgress = progressMap.values().stream().mapToDouble(Double::doubleValue).sum() / progressMap.size();

        // Import phase is weighted 60%, starts at 30% baseline (2% prep + 28% download)
        double overallProgress = 30.0 + (totalImportProgress * 60.0);

        // Format a detailed log message to display in the console
        StringBuilder sb = new StringBuilder("Ingesting into staging: ");
        progressMap.forEach((task, p) -> sb.append(task).append(String.format(" (%.0f%%) ", p * 100.0)));

        eventPublisher.publishEvent(ImportProgressEvent.progress(
                jobId, "IMPORTING", overallProgress, sb.toString()));
    }
}
