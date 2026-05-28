package dev.sonle.filmdb.importer.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.core.io.Resource;

@ConfigurationProperties(prefix = "app.importer")
public record ImporterProperties(
    Dataset dataset,
    Scripts scripts
) {
    public record Dataset(
        @DefaultValue("dataset/") String location
    ) {}

    public record Scripts(
        @DefaultValue("classpath:db/script/swap_staging_tables.sql") Resource swapStagingTables,
        @DefaultValue("classpath:db/script/drop_staging_indexes.sql") Resource dropStagingIndexes,
        @DefaultValue("classpath:db/script/create_staging_indexes.sql") Resource createStagingIndexes,
        @DefaultValue("classpath:db/script/wipe_staging_tables.sql") Resource wipeStagingTables
    ) {}
}
