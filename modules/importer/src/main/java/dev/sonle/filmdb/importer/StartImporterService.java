package dev.sonle.filmdb.importer;

import dev.sonle.filmdb.importer.service.ImdbImportService;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
public class StartImporterService {
    ImdbImportService imdbImportService;
    public  StartImporterService(ImdbImportService imdbImportService){
        this.imdbImportService = imdbImportService;
    }
    public void execute(){
        String path = "S:\\Coding\\Projects\\film-db-backup\\assets\\CompressedArtifacts\\title.basics.tsv.gz";
        imdbImportService.importMovies(path);
    }

    public CompletableFuture<Void> doImport(String path, String taskName){
        switch (taskName){
            case "movie" ->  imdbImportService.importMovies(path);
            case "person" -> imdbImportService.importPersons(path);
        }
        return CompletableFuture.completedFuture(null);
    }

//    public void executeAllAsync(){
//        String baseDir = "S:\\Coding\\Projects\\film-db-backup\\assets\\CompressedArtifacts\\";
//        String movie = baseDir + "title.basics.tsv.gz";
//        String person = baseDir + "name.basics.tsv.gz";
//        CompletableFuture<Void> m = doImport(movie, "movie");
//        CompletableFuture<Void> p = doImport(person, "person");
//        CompletableFuture.allOf(m,p).join();
//    }

    public void executeAll(){
        ExecutorService executor = Executors.newFixedThreadPool(8);
        String movie = "S:\\Coding\\Projects\\film-db-backup\\assets\\CompressedArtifacts\\title.basics.tsv.gz";
        String person = "S:\\Coding\\Projects\\film-db-backup\\assets\\CompressedArtifacts\\name.basics.tsv.gz";
        CompletableFuture<Void> movieTask = CompletableFuture.runAsync(() -> imdbImportService.importMovies(movie),executor);
        CompletableFuture<Void> personTask = CompletableFuture.runAsync(() -> imdbImportService.importPersons(person),executor);
        CompletableFuture.allOf(movieTask,personTask).join();
    }
}
