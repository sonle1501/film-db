import org.gradle.api.tasks.JavaExec
import org.gradle.api.tasks.testing.Test

val envFile = project.rootDir.resolve("secret.env")
val envVars = mutableMapOf<String, String>()

if (envFile.exists()) {
    envFile.useLines { lines ->
        lines.forEach { line ->
            val trimmed = line.trim()
            if (trimmed.isNotEmpty() && !trimmed.startsWith("#")) {
                val parts = trimmed.split("=", limit = 2)
                if (parts.size == 2) {
                    val key = parts[0].trim()
                    val value = parts[1].trim()
                    envVars[key] = value
                    System.setProperty(key, value)
                }
            }
        }
    }
    println("[env-loader] Loaded ${envVars.size} environment variables from secret.env")
} else {
    println("[env-loader] Warning: secret.env not found at ${envFile.absolutePath}")
}

if (envVars.isNotEmpty()) {
    tasks.withType<JavaExec>().configureEach {
        environment(envVars)
    }
    tasks.withType<Test>().configureEach {
        environment(envVars)
    }
}
