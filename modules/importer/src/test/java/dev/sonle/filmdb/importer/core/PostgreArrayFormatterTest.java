package dev.sonle.filmdb.importer.core;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PostgreArrayFormatterTest {

    private PostgreArrayFormatter formatter;

    @BeforeEach
    void setUp() {
        formatter = new PostgreArrayFormatter();
    }

    @Test
    void shouldFormatPersonDataCorrectly() {
        PostgreArrayFormatter.ArrayFormatter personFormatter = formatter.getPersonDataFormatter();

        // Input containing professions and known titles
        String[] input = {"nm0000001", "Fred Astaire", "1899", "1987", "soundtrack,actor,miscellaneous", "tt0028212,tt0031983"};
        String[] result = personFormatter.format(input);

        assertEquals("{soundtrack,actor,miscellaneous}", result[4]);
        assertEquals("{tt0028212,tt0031983}", result[5]);

        // Input containing null placeholders (\N) should not be formatted
        String[] nullInput = {"nm0000002", "Jane Doe", "\\N", "\\N", "\\N", "\\N"};
        String[] nullResult = personFormatter.format(nullInput);

        assertEquals("\\N", nullResult[4]);
        assertEquals("\\N", nullResult[5]);
    }

    @Test
    void shouldFormatMovieDataCorrectly() {
        PostgreArrayFormatter.ArrayFormatter movieFormatter = formatter.getMovieDataFormatter();

        String[] input = {"tt0000001", "short", "Carmencita", "Carmencita", "0", "1894", "\\N", "1", "Documentary,Short"};
        String[] result = movieFormatter.format(input);

        assertEquals("{Documentary,Short}", result[8]);

        String[] nullInput = {"tt0000002", "short", "Test", "Test", "0", "1895", "\\N", "1", "\\N"};
        String[] nullResult = movieFormatter.format(nullInput);

        assertEquals("\\N", nullResult[8]);
    }

    @Test
    void shouldFormatMovieAlternativeCorrectly() {
        PostgreArrayFormatter.ArrayFormatter altFormatter = formatter.getMovieAlternativeFormatter();

        String[] input = {"tt0000001", "1", "Carmencita - Title", "US", "alternative", "eng", "dvd", "0"};
        String[] result = altFormatter.format(input);

        assertEquals("{eng}", result[5]);
        assertEquals("{dvd}", result[6]);

        String[] nullInput = {"tt0000001", "1", "Carmencita - Title", "US", "alternative", "\\N", "\\N", "0"};
        String[] nullResult = altFormatter.format(nullInput);

        assertEquals("\\N", nullResult[5]);
        assertEquals("\\N", nullResult[6]);
    }

    @Test
    void shouldFormatMovieCrewCorrectly() {
        PostgreArrayFormatter.ArrayFormatter crewFormatter = formatter.getMovieCrewFormatter();

        String[] input = {"tt0000001", "nm0000001,nm0000002", "nm0000003"};
        String[] result = crewFormatter.format(input);

        assertEquals("{nm0000001,nm0000002}", result[1]);
        assertEquals("{nm0000003}", result[2]);

        String[] nullInput = {"tt0000001", "\\N", "\\N"};
        String[] nullResult = crewFormatter.format(nullInput);

        assertEquals("\\N", nullResult[1]);
        assertEquals("\\N", nullResult[2]);
    }

    @Test
    void shouldNotFormatWithNoneFormatter() {
        PostgreArrayFormatter.ArrayFormatter noneFormatter = formatter.getNoneFormatter();

        String[] input = {"a", "b", "c"};
        String[] result = noneFormatter.format(input);

        assertSame(input, result);
    }
}
