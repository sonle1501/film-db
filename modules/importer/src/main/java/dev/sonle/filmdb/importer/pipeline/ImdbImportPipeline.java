package dev.sonle.filmdb.importer.pipeline;

import dev.sonle.filmdb.importer.service.ImdbImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImdbImportPipeline {

    private final ImdbImportService imdbImportService;

    public void runImportPipeline(String baseDir) {
        log.info("Starting Import Pipeline...");
        executeImportedTasks(baseDir);

        log.info("Import Pipeline finished");
    }


    public void executeImportedTasks(String baseDir) {
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
            CompletableFuture<Void> movieTask = CompletableFuture.runAsync(() -> imdbImportService.importMovies(moviePath), executor);
            CompletableFuture<Void> personTask = CompletableFuture.runAsync(() -> imdbImportService.importPersons(personPath), executor);
            CompletableFuture<Void> alternativeTask = CompletableFuture.runAsync(() -> imdbImportService.importMovieAlternatives(alternativePath), executor);
            CompletableFuture<Void> crewTask = CompletableFuture.runAsync(() -> imdbImportService.importMovieCrews(crewPath), executor);
            CompletableFuture<Void> episodeTask = CompletableFuture.runAsync(() -> imdbImportService.importMovieEpisodes(episodePath), executor);
            CompletableFuture<Void> principalTask = CompletableFuture.runAsync(() -> imdbImportService.importMoviePrincipals(principalPath), executor);
            CompletableFuture<Void> ratingTask = CompletableFuture.runAsync(() -> imdbImportService.importMovieRatings(ratingPath), executor);

            CompletableFuture.allOf(
                    movieTask, personTask, alternativeTask,
                    crewTask, episodeTask, principalTask, ratingTask
            ).join();

            log.info("All parallel imported tasks completed.");
        } finally {
            executor.shutdown();
        }
    }
}
