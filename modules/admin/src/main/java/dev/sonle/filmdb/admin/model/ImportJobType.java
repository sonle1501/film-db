package dev.sonle.filmdb.admin.model;

public enum ImportJobType {
    FULL_WIPE_AND_LOAD,
    DELTA_UPSERT,
    DOWNLOAD_ONLY
}
