package dev.sonle.filmdb.importer.pipeline;

import dev.sonle.filmdb.importer.service.ImdbWiperService;
import dev.sonle.filmdb.importer.service.ImdbImportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class ImportPipeline {
    private static final Logger log = LoggerFactory.getLogger(ImportPipeline.class);
    
    private final ImdbWiperService dataWiper;
    private final ImdbImportService imdbImportService;
    
    private static final String BASE_DIR = "S:\\Coding\\Projects\\film-db-backup\\assets\\CompressedArtifacts\\";

    public ImportPipeline(ImdbWiperService dataWiper, ImdbImportService imdbImportService) {
        this.dataWiper = dataWiper;
        this.imdbImportService = imdbImportService;
    }

    public void runPipeline() {
        log.info("Starting Import Pipeline...");
        
        // step1: Wipe out data
        dataWiper.wipeData();
        
        // step2: Import data
        executeAllImports();
        
        log.info("Import Pipeline finished successfully.");
    }

    public void executeAllImports() {
        log.info("Starting parallel import tasks...");
        
        String moviePath = BASE_DIR + "title.basics.tsv.gz";
        String personPath = BASE_DIR + "name.basics.tsv.gz";
        String alternativePath = BASE_DIR + "title.akas.tsv.gz";
        String crewPath = BASE_DIR + "title.crew.tsv.gz";
        String episodePath = BASE_DIR + "title.episode.tsv.gz";
        String principalPath = BASE_DIR + "title.principals.tsv.gz";
        String ratingPath = BASE_DIR + "title.ratings.tsv.gz";

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
            
            log.info("All parallel import tasks completed.");
        } finally {
            executor.shutdown();
        }
    }
}
