package dev.sonle.filmdb.importer.core;

import org.springframework.stereotype.Component;

@Component
public class PostgreArrayFormatter {

    public ArrayFormatter getPersonDataFormatter(){
        ArrayFormatter lineFormatter = parts -> {
            // parts[4] is 'primaryProfession'
            if (parts.length > 4 && !parts[4].equals("\\N")) {
                parts[4] = "{" + parts[4] + "}";
            }
            // parts[5] is 'knownForTitles'
            if (parts.length > 5 && !parts[5].equals("\\N")) {
                parts[5] = "{" + parts[5] + "}";
            }
            return parts;
        };
        return lineFormatter;
    }

    public ArrayFormatter getMovieDataFormatter(){
        ArrayFormatter lineFormatter = parts -> {
            // parts[8] is 'genres' (e.g., "Action,Drama" -> "{Action,Drama}")
            if (parts.length > 8 && !parts[8].equals("\\N")) {
                parts[8] = "{" + parts[8] + "}";
            }
            return parts;
        };
        return lineFormatter;
    }

    public ArrayFormatter getMovieAlternativeFormatter(){
        ArrayFormatter lineFormatter = parts -> {
            if (parts.length > 5 && !parts[5].equals("\\N")) {
                parts[5] = "{" + parts[5] + "}";
            }
            if (parts.length > 6 && !parts[6].equals("\\N")) {
                parts[6] = "{" + parts[6] + "}";
            }
            return parts;
        };
        return lineFormatter;
    }

    public ArrayFormatter getMovieCrewFormatter(){
        ArrayFormatter lineFormatter = parts -> {
            if (parts.length > 1 && !parts[1].equals("\\N")) {
                parts[1] = "{" + parts[1] + "}";
            }
            if (parts.length > 2 && !parts[2].equals("\\N")) {
                parts[2] = "{" + parts[2] + "}";
            }
            return parts;
        };
        return lineFormatter;
    }

    public ArrayFormatter getNoneFormatter(){
        ArrayFormatter lineFormatter = parts -> parts;  // format nothing, just return the original
        return lineFormatter;
    }

    @FunctionalInterface
    public interface ArrayFormatter {
        String[] format(String[] parts);
    }
}
