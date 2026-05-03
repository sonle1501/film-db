pluginManagement {
    includeBuild("build-logic")
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}

// metadata about the project

rootProject.name = "film-db"

// Apps
include("apps:backend")

// Modules
include("modules:importer")
include("modules:search")
include("modules:imdb")
include("modules:shared")
include("modules:users")
include("modules:admin")