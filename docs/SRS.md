# 🎬 Film-DB: Requirements Specification

This document specifies the functional and non-functional requirements for the Film-DB client-server application, establishing a clear link between frontend capabilities and the Spring Boot modular monolith backend API endpoints.

---

## 1. Functional Requirements (FR)

> [!NOTE]
> All functional requirements utilize the prefix `FR-<domain>-<id>` for clean traceability. Every request maps directly to a verified endpoint in the Spring Boot backend OpenAPI specification.

### 1.1 Authentication & Profile (AUTH)

#### `FR-AUTH-01: User Registration`
* **Description**: Registers a new visitor as a standard user.
* **Input**:
  * Path: `POST /api/auth/register`
  * Body (`application/json`):
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
* **Output**: `200 OK`
  * Body (`application/json`):
    ```json
    {
      "token": "string"
    }
    ```
* **Note**: A secure `refresh_jwt` HttpOnly cookie is set by the backend containing the refresh token.

#### `FR-AUTH-02: Admin Registration Request`
* **Description**: Allows administrative users to request account creation. These accounts start in a pending state until approved by an active administrator.
* **Input**:
  * Path: `POST /api/auth/register/admin`
  * Body (`application/json`):
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
* **Output**: `200 OK`
  * Body (`application/json`):
    ```json
    {
      "token": "string"
    }
    ```
* **Note**: Created users start with state `PENDING_APPROVAL` and role `ROLE_ADMIN` but cannot access administrative endpoints until approved.

#### `FR-AUTH-03: User Login`
* **Description**: Authenticates users using their username and password.
* **Input**:
  * Path: `POST /api/auth/login`
  * Body (`application/json`):
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
* **Output**: `200 OK`
  * Body (`application/json`):
    ```json
    {
      "token": "string"
    }
    ```
* **Note**: Sets a companion HttpOnly cookie containing the refresh token (`refresh_jwt`).

#### `FR-AUTH-04: Token Refresh`
* **Description**: Refreshes the short-lived access token using the HttpOnly refresh token cookie.
* **Input**:
  * Path: `POST /api/auth/refresh`
  * Cookie: `refresh_jwt=string`
* **Output**: `200 OK`
  * Body (`application/json`):
    ```json
    {
      "token": "string"
    }
    ```

#### `FR-AUTH-05: User Logout`
* **Description**: Invalidates the current user session and clears the HttpOnly refresh token cookie.
* **Input**:
  * Path: `POST /api/auth/logout`
* **Output**: `200 OK`
  * Body: Empty

#### `FR-AUTH-06: Profile Details Lookup`
* **Description**: Retrieves public profile information for a specific username.
* **Input**:
  * Path: `GET /api/v1/user/profile`
  * Query Parameter: `username=string` (required)
* **Output**: `200 OK`
  * Body (`application/json`):
    ```json
    {
      "userId": "uuid",
      "displayName": "string",
      "username": "string",
      "dateCreated": "date-time",
      "bio": "string",
      "role": "string",
      "userState": "string"
    }
    ```

#### `FR-AUTH-07: Update Profile Metadata`
* **Description**: Allows logged-in users to update their profile bio and display name.
* **Input**:
  * Path: `PATCH /api/v1/user/profile`
  * Headers: `Authorization: Bearer <token>`
  * Body (`application/json`):
    ```json
    {
      "bio": "string",
      "displayName": "string"
    }
    ```
* **Output**: `200 OK`
  * Body (`text/plain`): `"Update profile user profile success"`

#### `FR-AUTH-08: Change Username`
* **Description**: Allows a user to change their account username, requiring verification of credentials.
* **Input**:
  * Path: `PUT /api/v1/user/profile/username`
  * Headers: `Authorization: Bearer <token>`
  * Body (`application/json`):
    ```json
    {
      "username": "string",
      "password": "string",
      "newUsername": "string"
    }
    ```
* **Output**: `200 OK`
  * Body (`text/plain`): `"Change username success!"`

#### `FR-AUTH-09: Request Admin Role`
* **Description**: Allows an existing standard user to request promotion to the Admin role.
* **Input**:
  * Path: `POST /api/v1/user/profile/request-admin`
  * Headers: `Authorization: Bearer <token>`
* **Output**: `200 OK`
  * Body (`text/plain`): `"Request admin role success"`
* **Note**: Creates a pending request task in the admin queue for approval.

---

### 1.2 IMDB Search & Discovery (DISC)

#### `FR-DISC-01: Advanced Movie Filtering`
* **Description**: Retrieves a paginated list of movies based on start year, minimum average rating, minimum votes, title type, and genre.
* **Input**:
  * Path: `PATCH /api/v1/imdb/listfilm/filter`
  * Query Parameters: `page=0` (optional), `size=10` (optional)
  * Body (`application/json`):
    ```json
    {
      "startYear": 2010,
      "averageRating": 8.0,
      "numVotes": 10000,
      "titleType": "movie",
      "genre": "Action"
    }
    ```
* **Output**: `200 OK`
  * Body (`application/json`): Paginated payload (`PageMovieRatingInfoDto`)
    ```json
    {
      "totalElements": 448,
      "totalPages": 45,
      "size": 10,
      "number": 0,
      "content": [
        {
          "movieId": "tt1375666",
          "primaryTitle": "Inception",
          "originalTitle": "Inception",
          "isAdult": false,
          "startYear": 2010,
          "runtimeMinutes": 148,
          "genres": ["Action", "Adventure", "Sci-Fi"],
          "averageRating": 8.8,
          "numVotes": 2400000,
          "imageUrl": "string"
        }
      ],
      "first": true,
      "last": false,
      "numberOfElements": 1,
      "empty": false
    }
    ```

#### `FR-DISC-02: Movie Filtering and Sorting`
* **Description**: Filters titles based on criteria and supports sorting by specific fields and directions.
* **Input**:
  * Path: `PATCH /api/v1/imdb/listfilm/filter/sort`
  * Query Parameters: `page=0` (optional), `size=10` (optional)
  * Body (`application/json`):
    ```json
    {
      "startYear": 1999,
      "averageRating": 7.5,
      "numVotes": 5000,
      "titleType": "movie",
      "sortBy": "averageRating",
      "sortDirection": "DESC",
      "genre": "Drama"
    }
    ```
* **Output**: `200 OK`
  * Body (`application/json`): `PageMovieRatingInfoDto` (similar to `FR-DISC-01`).

#### `FR-DISC-03: Filter Movies by Exact Year`
* **Description**: Retrieves a paginated list of movies filtered by the exact release year.
* **Input**:
  * Path: `PATCH /api/v1/imdb/listfilm/filter-year`
  * Query Parameters: `page=0` (optional), `size=10` (optional)
  * Body (`application/json`): `MovieFilterRequestDto` (same as `FR-DISC-01`)
* **Output**: `200 OK`
  * Body (`application/json`): `PageMovieRatingInfoDto`

#### `FR-DISC-04: Filter and Sort Movies by Exact Year`
* **Description**: Retrieves a paginated list of movies filtered by the exact release year and sorted by specific criteria.
* **Input**:
  * Path: `PATCH /api/v1/imdb/listfilm/filter-year/sort`
  * Query Parameters: `page=0` (optional), `size=10` (optional)
  * Body (`application/json`): `MovieFilterSortRequestDto` (same as `FR-DISC-02`)
* **Output**: `200 OK`
  * Body (`application/json`): `PageMovieRatingInfoDto`

#### `FR-DISC-05: Get Top Rated TV Series`
* **Description**: Retrieves static top-rated TV Series listings.
* **Input**:
  * Path: `GET /api/v1/imdb/listfilm/top-rated-tvseries`
* **Output**: `200 OK`
  * Body (`application/json`): `Array<MovieRatingInfoDto>`

#### `FR-DISC-06: Get Top Rated Movies`
* **Description**: Retrieves static top-rated movie listings.
* **Input**:
  * Path: `GET /api/v1/imdb/listfilm/top-rated-movies`
* **Output**: `200 OK`
  * Body (`application/json`): `Array<MovieRatingInfoDto>`

#### `FR-DISC-07: Get Recent Movies by Year`
* **Description**: Retrieves a list of basic movie metadata released in a specific year.
* **Input**:
  * Path: `GET /api/v1/imdb/listfilm/recent`
  * Query Parameter: `year=integer` (required)
* **Output**: `200 OK`
  * Body (`application/json`): `Array<MovieBasicInfoDto>`
    ```json
    [
      {
        "movieId": "tt1375666",
        "primaryTitle": "Inception",
        "originalTitle": "Inception",
        "isAdult": false,
        "startYear": 2010,
        "runtimeMinutes": 148,
        "genres": ["Action", "Adventure", "Sci-Fi"],
        "imageUrl": "string"
      }
    ]
    ```

#### `FR-DISC-08: Filter Movies by Rating`
* **Description**: Returns movies filtered by a specific average rating.
* **Input**:
  * Path: `GET /api/v1/imdb/listfilm/rating/{rating}`
  * Path Parameter: `rating=number` (double, required)
* **Output**: `200 OK`
  * Body (`application/json`): `Array<MovieRatingInfoDto>`

#### `FR-DISC-09: Get Most Popular Movies`
* **Description**: Retrieves currently popular movies.
* **Input**:
  * Path: `GET /api/v1/imdb/listfilm/popular-movies`
* **Output**: `200 OK`
  * Body (`application/json`): `Array<MovieRatingInfoDto>`

#### `FR-DISC-10: Get Movies by Localized Name`
* **Description**: Searches movies using alternative or localized titles.
* **Input**:
  * Path: `GET /api/v1/imdb/listfilm/localized`
  * Query Parameter: `name=string` (required)
* **Output**: `200 OK`
  * Body (`application/json`): `Array<MovieSupplementInfoDto>`
    ```json
    [
      {
        "movieId": "tt1375666",
        "localizedTitles": [
          {
            "title": "Inception: El origen",
            "region": "MX",
            "language": "es"
          }
        ]
      }
    ]
    ```

#### `FR-DISC-11: Filter Movies by Name`
* **Description**: Filters titles matching a raw text string.
* **Input**:
  * Path: `GET /api/v1/imdb/listfilm/by-name`
  * Query Parameter: `name=string` (required)
* **Output**: `200 OK`
  * Body (`application/json`): `Array<MovieBasicInfoDto>`

#### `FR-DISC-12: Filter Movies by Name with Limit/Paging`
* **Description**: Filters titles matching a text query in a paginated format.
* **Input**:
  * Path: `GET /api/v1/imdb/listfilm/by-name-limit`
  * Query Parameters: `name=string` (required), `page=0` (optional), `size=10` (optional)
* **Output**: `200 OK`
  * Body (`application/json`): `PageMovieBasicInfoDto`

#### `FR-DISC-13: Filter Movies by Name and Type`
* **Description**: Filters titles matching a name and a specific title type (e.g. short, tvSpecial).
* **Input**:
  * Path: `GET /api/v1/imdb/listfilm/by-name-and-type`
  * Query Parameters: `name=string` (required), `type=string` (required)
* **Output**: `200 OK`
  * Body (`application/json`): `Array<MovieBasicInfoDto>`

#### `FR-DISC-14: Filter Movies by Name and Genre`
* **Description**: Filters titles matching a name query and a specific genre.
* **Input**:
  * Path: `GET /api/v1/imdb/listfilm/by-name-and-genre`
  * Query Parameters: `name=string` (required), `genre=string` (required)
* **Output**: `200 OK`
  * Body (`application/json`): `Array<MovieBasicInfoDto>`

#### `FR-DISC-15: Filter Movies by Genre`
* **Description**: Retrieves a paginated list of movies for a specific genre.
* **Input**:
  * Path: `GET /api/v1/imdb/listfilm/by-genre`
  * Query Parameters: `genre=string` (required), `page=0` (optional), `size=10` (optional)
* **Output**: `200 OK`
  * Body (`application/json`): `PageMovieBasicInfoDto`

#### `FR-DISC-16: Get All Genres`
* **Description**: Retrieves a list of all unique movie genres stored in the database.
* **Input**:
  * Path: `GET /api/v1/imdb/genres`
* **Output**: `200 OK`
  * Body (`application/json`): `Array<string>` (e.g., `["Action", "Comedy", "Sci-Fi"]`)

#### `FR-DISC-17: Movie Detail Lookup`
* **Description**: Returns core metadata and basic parameters for a specific film.
* **Input**:
  * Path: `GET /api/v1/imdb/film/{film-id}`
  * Path Parameter: `film-id=string` (IMDB ID, e.g. `tt1375666`)
* **Output**: `200 OK`
  * Body (`application/json`): `MovieBasicInfoDto`

#### `FR-DISC-18: Get Movie People/Cast`
* **Description**: Retrieves characters, roles, and cast details associated with a movie.
* **Input**:
  * Path: `GET /api/v1/imdb/film/{film-id}/people`
  * Path Parameter: `film-id=string` (required)
* **Output**: `200 OK`
  * Body (`application/json`): `Array<MoviePersonInfoDto>`
    ```json
    [
      {
        "personId": "nm0000138",
        "primaryName": "Leonardo DiCaprio",
        "birthYear": 1974,
        "deathYear": null,
        "category": "actor",
        "job": "actor",
        "characters": "Cobb"
      }
    ]
    ```

#### `FR-DISC-19: Get Movie Image`
* **Description**: Returns or redirects to the cover image of a movie.
* **Input**:
  * Path: `GET /api/v1/imdb/film/{film-id}/image`
  * Path Parameter: `film-id=string` (required)
* **Output**: `200 OK` (binary image payload).

#### `FR-DISC-20: Get Movie Crew`
* **Description**: Retrieves directors and writers of a specific movie.
* **Input**:
  * Path: `GET /api/v1/imdb/film/{film-id}/crew`
  * Path Parameter: `film-id=string` (required)
* **Output**: `200 OK`
  * Body (`application/json`): `MovieCrewInfoDto`
    ```json
    {
      "movieId": "tt1375666",
      "directors": [
        {
          "personId": "nm0000204",
          "primaryName": "Christopher Nolan",
          "birthYear": 1970,
          "deathYear": null
        }
      ],
      "writers": [
        {
          "personId": "nm0000204",
          "primaryName": "Christopher Nolan",
          "birthYear": 1970,
          "deathYear": null
        }
      ]
    }
    ```

#### `FR-DISC-21: Get Movie Rating Info`
* **Description**: Retrieves rating score and vote count metrics.
* **Input**:
  * Path: `GET /api/v1/imdb/film/rating/{film-id}`
  * Path Parameter: `film-id=string` (required)
* **Output**: `200 OK`
  * Body (`application/json`): `MovieRatingInfoDto`

#### `FR-DISC-22: Full Movie Detail Lookup`
* **Description**: Returns complete details including average rating, vote count, and cast list.
* **Input**:
  * Path: `GET /api/v1/imdb/film/full/{film-id}`
  * Path Parameter: `film-id=string` (required)
* **Output**: `200 OK`
  * Body (`application/json`): `MovieFullInfoDto`
    ```json
    {
      "movieId": "tt1375666",
      "primaryTitle": "Inception",
      "originalTitle": "Inception",
      "isAdult": false,
      "startYear": 2010,
      "runtimeMinutes": 148,
      "genres": ["Action", "Adventure", "Sci-Fi"],
      "averageRating": 8.8,
      "numVotes": 2400000,
      "imageUrl": "string",
      "persons": [
        {
          "personId": "nm0000138",
          "primaryName": "Leonardo DiCaprio",
          "category": "actor",
          "characters": "Cobb"
        }
      ]
    }
    ```

#### `FR-DISC-23: Get Movie Supplement Info`
* **Description**: Retrieves localized title listings for regional distributions.
* **Input**:
  * Path: `GET /api/v1/imdb/film/alternative/{film-id}`
  * Path Parameter: `film-id=string` (required)
* **Output**: `200 OK`
  * Body (`application/json`): `MovieSupplementInfoDto`

#### `FR-DISC-24: TV Series Seasons Count`
* **Description**: Returns the total number of seasons for a given TV Series ID.
* **Input**:
  * Path: `GET /api/v1/imdb/tvseries/{film-id}/seasons`
  * Path Parameter: `film-id=string` (required)
* **Output**: `200 OK`
  * Body (`application/json`): `integer`

#### `FR-DISC-25: TV Series Episodes by Season`
* **Description**: Retrieves all episodes belonging to a specific season of a TV Series.
* **Input**:
  * Path: `GET /api/v1/imdb/tvseries/{film-id}/episodes`
  * Path Parameter: `film-id=string` (required)
  * Query Parameter: `season=integer` (required)
* **Output**: `200 OK`
  * Body (`application/json`): `Array<EpisodeInfoDto>`
    ```json
    [
      {
        "episodeId": "tt1234567",
        "parentMovieId": "tt0944947",
        "seasonNumber": 1,
        "episodeNumber": 1,
        "primaryTitle": "Winter Is Coming",
        "originalTitle": "Winter Is Coming",
        "startYear": 2011,
        "runtimeMinutes": 62
      }
    ]
    ```

#### `FR-DISC-26: Get TV Series by Name`
* **Description**: Returns television shows matching a name search.
* **Input**:
  * Path: `GET /api/v1/imdb/tvseries/{film-id}/by-name`
  * Path Parameter: `film-id=string` (required)
  * Query Parameter: `name=string` (required)
* **Output**: `200 OK`
  * Body (`application/json`): `Array<MovieBasicInfoDto>`

#### `FR-DISC-27: Get Episode Info`
* **Description**: Retrieves details for an episode.
* **Input**:
  * Path: `GET /api/v1/imdb/tvseries/{episode-id}`
  * Path Parameter: `episode-id=string` (required)
* **Output**: `200 OK`
  * Body (`application/json`): `EpisodeInfoDto`

#### `FR-DISC-28: Get Person Basic Info`
* **Description**: Retrieves basic professional bio profile of a person.
* **Input**:
  * Path: `GET /api/v1/imdb/person/{person-id}`
  * Path Parameter: `person-id=string` (required)
* **Output**: `200 OK`
  * Body (`application/json`): `PersonInfoDto`
    ```json
    {
      "personId": "nm0000204",
      "primaryName": "Christopher Nolan",
      "birthYear": 1970,
      "deathYear": null,
      "primaryProfession": ["director", "writer", "producer"],
      "knownForTitles": ["tt1375666", "tt0468569"]
    }
    ```

#### `FR-DISC-29: Get Person Details`
* **Description**: Retrieves professional profile and standard titles known for.
* **Input**:
  * Path: `GET /api/v1/imdb/person/{person-id}/details`
  * Path Parameter: `person-id=string` (required)
* **Output**: `200 OK`
  * Body (`application/json`): `PersonDetailsDto`
    ```json
    {
      "personId": "nm0000204",
      "primaryName": "Christopher Nolan",
      "primaryProfession": ["director", "writer", "producer"],
      "knownForTitles": [
        {
          "movieId": "tt1375666",
          "primaryTitle": "Inception",
          "originalTitle": "Inception",
          "isAdult": false,
          "startYear": 2010,
          "runtimeMinutes": 148,
          "genres": ["Action", "Adventure", "Sci-Fi"],
          "imageUrl": "string"
        }
      ]
    }
    ```

#### `FR-DISC-30: Get Person Career Movies`
* **Description**: Returns all movies a person participated in.
* **Input**:
  * Path: `GET /api/v1/imdb/person/{person-id}/career`
  * Path Parameter: `person-id=string` (required)
* **Output**: `200 OK`
  * Body (`application/json`): `Array<MovieBasicInfoDto>`

---

### 1.3 Smart Search Engine (SEARCH)

#### `FR-SEARCH-01: Smart Search`
* **Description**: Full-text smart search on movies and TV shows.
* **Input**:
  * Path: `GET /api/v1/search`
  * Query Parameters: `query=string` (required), `page=0` (optional), `size=10` (optional)
* **Output**: `200 OK`
  * Body (`application/json`): `PageMovieSearchResultDto`
    ```json
    {
      "totalElements": 200,
      "totalPages": 20,
      "size": 10,
      "number": 0,
      "content": [
        {
          "movieId": "tt1375666",
          "primaryTitle": "Inception",
          "originalTitle": "Inception",
          "titleType": "movie",
          "startYear": 2010,
          "genres": ["Action", "Sci-Fi"],
          "averageRating": 8.8,
          "numVotes": 2400000,
          "relevanceScore": 1.25,
          "imageUrl": "string"
        }
      ],
      "first": true,
      "last": false,
      "numberOfElements": 1,
      "empty": false
    }
    ```

#### `FR-SEARCH-02: Vietnamese Search`
* **Description**: Executes a search utilizing Vietnamese accent normalization.
* **Input**:
  * Path: `GET /api/v1/search/vn`
  * Query Parameters: `query=string` (required), `page=0` (optional), `size=10` (optional)
* **Output**: `200 OK`
  * Body (`application/json`): `PageMovieSearchResultDto`

#### `FR-SEARCH-03: Live Vietnamese Search (Suggestions)`
* **Description**: Real-time autocomplete suggestions using Vietnamese accent normalization.
* **Input**:
  * Path: `GET /api/v1/search/vn/live`
  * Query Parameters: `query=string` (required), `limit=5` (optional)
* **Output**: `200 OK`
  * Body (`application/json`): `Array<MovieSearchResultDto>`

#### `FR-SEARCH-04: Live Smart Search (Suggestions)`
* **Description**: Real-time autocomplete suggestions for smart queries.
* **Input**:
  * Path: `GET /api/v1/search/live`
  * Query Parameters: `query=string` (required), `limit=5` (optional)
* **Output**: `200 OK`
  * Body (`application/json`): `Array<MovieSearchResultDto>`

---

### 1.4 User Lists & Curation (LIST)

#### `FR-LIST-01: Create Custom List with Metadata`
* **Description**: Users can create custom movie collections with metadata.
* **Input**:
  * Path: `POST /api/v1/users/lists`
  * Headers: `Authorization: Bearer <token>`
  * Body (`application/json`):
    ```json
    {
      "nameList": "My Sci-Fi Classics",
      "type": "MIXTURE",
      "isPublic": true
    }
    ```
* **Output**: `200 OK`
  * Body (`text/plain`): `"Create User list success!"`

#### `FR-LIST-02: Get Lists by Name`
* **Description**: Retrieves a list of user lists filtering by title query.
* **Input**:
  * Path: `GET /api/v1/users/lists`
  * Query Parameter: `nameList=string` (required)
* **Output**: `200 OK`
  * Body (`application/json`): `Array<UserListDto>`

#### `FR-LIST-03: Update List Metadata`
* **Description**: Updates list properties including visibility, custom flag, or type.
* **Input**:
  * Path: `PATCH /api/v1/users/lists`
  * Headers: `Authorization: Bearer <token>`
  * Body (`application/json`):
    ```json
    {
      "userId": "uuid",
      "listId": "uuid",
      "nameList": "Must Watch Sci-Fi",
      "isPublic": false,
      "isCustom": true,
      "listType": "PLAN_TO_WATCH"
    }
    ```
* **Output**: `200 OK`
  * Body (`text/plain`): `"Update metadata user list success!"`

#### `FR-LIST-04: Set List Public`
* **Description**: Sets user list visibility to public.
* **Input**:
  * Path: `PUT /api/v1/users/lists/{list-id}/public`
  * Path Parameter: `list-id=string` (UUID, required)
* **Output**: `200 OK`
  * Body (`text/plain`): String confirmation message.

#### `FR-LIST-05: Set List Private`
* **Description**: Restricts user list visibility to private.
* **Input**:
  * Path: `PUT /api/v1/users/lists/{list-id}/private`
  * Path Parameter: `list-id=string` (UUID, required)
* **Output**: `200 OK`
  * Body (`text/plain`): String confirmation message.

#### `FR-LIST-06: Toggle Custom List Status`
* **Description**: Toggles list custom property flag.
* **Input**:
  * Path: `PUT /api/v1/users/lists/{list-id}/custom`
  * Path Parameter: `list-id=string` (UUID, required)
* **Output**: `200 OK`
  * Body (`text/plain`): String confirmation message.

#### `FR-LIST-07: Create System List`
* **Description**: Initializes pre-seeded system default list types (e.g. watchlists, favorites).
* **Input**:
  * Path: `POST /api/v1/users/lists/system-list`
  * Body (`application/json`):
    ```json
    {
      "userId": "uuid",
      "nameList": "string",
      "type": "string"
    }
    ```
* **Output**: `200 OK`
  * Body (`text/plain`): String confirmation message.

#### `FR-LIST-08: Create Simple List`
* **Description**: Quickly registers a basic list.
* **Input**:
  * Path: `POST /api/v1/users/lists/simple-list`
  * Query Parameter: `nameList=string` (required)
* **Output**: `200 OK`
  * Body (`text/plain`): String confirmation message.

#### `FR-LIST-09: Get List by ID`
* **Description**: Returns configuration summary parameters of a specific list by ID.
* **Input**:
  * Path: `GET /api/v1/users/lists/{list-id}`
  * Path Parameter: `list-id=string` (UUID, required)
* **Output**: `200 OK`
  * Body (`application/json`): `UserListDto`

#### `FR-LIST-10: Delete List by ID`
* **Description**: Deletes a user list.
* **Input**:
  * Path: `DELETE /api/v1/users/lists/{list-id}`
  * Path Parameter: `list-id=string` (UUID, required)
* **Output**: `200 OK`
  * Body (`text/plain`): String confirmation message.

#### `FR-LIST-11: View All Personal Lists`
* **Description**: Returns all watchlists, favorites, and custom lists owned by the authenticated user.
* **Input**:
  * Path: `GET /api/v1/users/lists/all`
  * Headers: `Authorization: Bearer <token>`
* **Output**: `200 OK`
  * Body (`application/json`): `Array<UserListDto>`
    ```json
    [
      {
        "listId": "ac820078-43d9-40fe-8f0a-1563f6ba012b",
        "userId": "d3b07384-d113-4ecb-a320-fd0e19488349",
        "nameList": "Must Watch Sci-Fi",
        "listType": "PLAN_TO_WATCH",
        "isCustom": true,
        "isPublic": false,
        "dateCreated": "2026-05-23T20:00:00Z"
      }
    ]
    ```

#### `FR-LIST-12: Add Item to List`
* **Description**: Appends a movie or TV show to a user list with watch status and review notes.
* **Input**:
  * Path: `POST /api/v1/users/lists/{list-id}/item`
  * Headers: `Authorization: Bearer <token>`
  * Path Parameter: `list-id=string` (UUID, required)
  * Body (`application/json`):
    ```json
    {
      "movieId": "tt1375666",
      "state": "PLAN_TO_WATCH",
      "notes": "Need to rewatch this in IMAX if possible."
    }
    ```
* **Output**: `200 OK`
  * Body (`text/plain`): `"Add list item details success!"`

#### `FR-LIST-13: Update List Item Details`
* **Description**: Updates watch status or review notes on a specific item.
* **Input**:
  * Path: `PATCH /api/v1/users/lists/{list-id}/item`
  * Headers: `Authorization: Bearer <token>`
  * Path Parameter: `list-id=string` (UUID, required)
  * Body (`application/json`):
    ```json
    {
      "itemId": "uuid",
      "state": "WATCHED",
      "notes": "Loved the Hans Zimmer score!"
    }
    ```
* **Output**: `200 OK`
  * Body (`text/plain`): `"Update details metadata list item details success!"`

#### `FR-LIST-14: Get All List Items`
* **Description**: Retrieves all items stored within a list.
* **Input**:
  * Path: `GET /api/v1/users/lists/{list-id}/items`
  * Path Parameter: `list-id=string` (UUID, required)
* **Output**: `200 OK`
  * Body (`application/json`): `Array<ListItemDto>`
    ```json
    [
      {
        "itemId": "uuid",
        "listId": "uuid",
        "movieId": "tt1375666",
        "state": "PLAN_TO_WATCH",
        "notes": "string"
      }
    ]
    ```

#### `FR-LIST-15: Get Single List Item Details`
* **Description**: Fetches info for a specific list item inside a list.
* **Input**:
  * Path: `GET /api/v1/users/lists/{list-id}/item/{item-id}`
  * Path Parameters: `list-id=string` (UUID, required), `item-id=string` (UUID, required)
* **Output**: `200 OK`
  * Body (`application/json`): `ListItemDto`

#### `FR-LIST-16: Remove Item from List`
* **Description**: Removes an item reference from a user list.
* **Input**:
  * Path: `DELETE /api/v1/users/lists/{list-id}/item/{item-id}`
  * Headers: `Authorization: Bearer <token>`
  * Path Parameters: `list-id=string` (UUID, required), `item-id=string` (UUID, required)
* **Output**: `200 OK`
  * Body (`text/plain`): `"Delete list item details success"`

---

### 1.5 Administrative Console (ADM)

#### `FR-ADM-01: View Pending Admin Requests`
* **Description**: Lists pending approval tasks for admin promotions.
* **Input**:
  * Path: `GET /api/admin/job/pending-tasks`
  * Headers: `Authorization: Bearer <admin_token>`
* **Output**: `200 OK`
  * Body (`application/json`): `Array<PendingRequestDto>`
    ```json
    [
      {
        "taskId": "uuid",
        "initiator": "uuid",
        "targetEntityId": "string",
        "actionType": "ADMIN_APPROVAL",
        "state": "PENDING",
        "description": "string",
        "priority": 1,
        "createdAt": "date-time"
      }
    ]
    ```

#### `FR-ADM-02: Approve Admin Request`
* **Description**: Promotes a pending user to administrative state.
* **Input**:
  * Path: `POST /api/admin/job/approve-admin`
  * Headers: `Authorization: Bearer <admin_token>`
  * Query Parameter: `userId=string` (UUID, required)
* **Output**: `200 OK`
  * Body (`text/plain`): `"Approve admin for user success"`

#### `FR-ADM-03: Reject Admin Request`
* **Description**: Rejects a pending admin request.
* **Input**:
  * Path: `POST /api/admin/job/reject-admin`
  * Headers: `Authorization: Bearer <admin_token>`
  * Query Parameter: `userId=string` (UUID, required)
* **Output**: `200 OK`
  * Body (`text/plain`): String confirmation message.

#### `FR-ADM-04: Ban User`
* **Description**: Bans a user account, preventing login and token refreshes.
* **Input**:
  * Path: `PUT /api/admin/users/{user-id}/state/ban`
  * Headers: `Authorization: Bearer <admin_token>`
  * Path Parameter: `user-id=string` (UUID, required)
* **Output**: `200 OK`
  * Body (`text/plain`): `"Ban user success!"`

#### `FR-ADM-05: Activate User`
* **Description**: Re-enables a banned user account.
* **Input**:
  * Path: `PUT /api/admin/users/{user-id}/state/active`
  * Headers: `Authorization: Bearer <admin_token>`
  * Path Parameter: `user-id=string` (UUID, required)
* **Output**: `200 OK`
  * Body (`text/plain`): String confirmation message.

#### `FR-ADM-06: Get User Info Details`
* **Description**: Retrieves details for a specific user ID.
* **Input**:
  * Path: `GET /api/admin/users/{user-id}/user-info`
  * Headers: `Authorization: Bearer <admin_token>`
  * Path Parameter: `user-id=string` (UUID, required)
* **Output**: `200 OK`
  * Body (`application/json`): `UserInfoProjection`
    ```json
    {
      "userId": "uuid",
      "displayName": "string",
      "username": "string",
      "dateCreated": "date-time",
      "bio": "string",
      "role": "string",
      "userState": "string"
    }
    ```

#### `FR-ADM-07: Get All User Infos`
* **Description**: Retrieves information for all users.
* **Input**:
  * Path: `GET /api/admin/users/user-infos`
  * Headers: `Authorization: Bearer <admin_token>`
* **Output**: `200 OK`
  * Body (`application/json`): `Array<UserInfoProjection>`

#### `FR-ADM-08: Get User Lists by User ID`
* **Description**: Returns all watchlists and custom lists owned by a user.
* **Input**:
  * Path: `GET /api/admin/userlist/{user-id}/lists`
  * Headers: `Authorization: Bearer <admin_token>`
  * Path Parameter: `user-id=string` (UUID, required)
* **Output**: `200 OK`
  * Body (`application/json`): `Array<UserListProjection>`
    ```json
    [
      {
        "listId": "uuid",
        "userId": "uuid",
        "nameList": "string",
        "listType": "string",
        "isPublic": true,
        "isCustom": true,
        "dateCreated": "date-time"
      }
    ]
    ```

#### `FR-ADM-09: Get All User Lists`
* **Description**: Retrieves all lists in the system.
* **Input**:
  * Path: `GET /api/admin/userlist/all-lists`
  * Headers: `Authorization: Bearer <admin_token>`
* **Output**: `200 OK`
  * Body (`application/json`): `Array<UserListProjection>`

#### `FR-ADM-10: Trigger Data Import Pipeline`
* **Description**: Initiates backend workers to download, extract, and bulk-load IMDB TSV files into PostgreSQL.
* **Input**:
  * Path: `POST /api/admin/import-pipeline/run`
  * Headers: `Authorization: Bearer <admin_token>`
* **Output**: `200 OK`
  * Body (`application/json`): `ImportJobHistory`
    ```json
    {
      "jobId": "uuid",
      "jobType": "FULL_WIPE_AND_LOAD",
      "targetDataset": "string",
      "status": "PENDING",
      "rowsProcessed": 0,
      "startTime": "date-time",
      "endTime": null,
      "errorMessage": null,
      "triggeredBy": "uuid",
      "progress": 0.0,
      "currentStage": "string",
      "logs": []
    }
    ```
* **Note**: Clears existing tables, streams dataset files, and executes high-speed PostgreSQL `COPY` queries.

#### `FR-ADM-11: Get Import Job Status`
* **Description**: Retrieves progress and details for a triggered dataset import job.
* **Input**:
  * Path: `GET /api/admin/import-pipeline/status`
  * Headers: `Authorization: Bearer <admin_token>`
  * Query Parameter: `jobId=string` (UUID, required)
* **Output**: `200 OK`
  * Body (`application/json`): `ImportJobHistory`

#### `FR-ADM-12: Get Import Job History`
* **Description**: Returns status logs of all previous import jobs.
* **Input**:
  * Path: `GET /api/admin/import-pipeline/history`
  * Headers: `Authorization: Bearer <admin_token>`
* **Output**: `200 OK`
  * Body (`application/json`): `Array<ImportJobHistory>`

---

## 2. Non-functional Requirements (NFR)

### 2.1 Performance & Latency
* **NFR-PERF-01**: IMDB movie list filtering must return sub-second response times (less than **500ms** latency under 100 concurrent requests). This is supported by composite PostgreSQL indexing on `averageRating`, `startYear`, and `genres`.
* **NFR-PERF-02**: Long scrollable pages (like lists of all movies or admin audit users lists) must implement virtual scrolling or infinite pagination to minimize DOM node overhead in the client browser.

### 2.2 Security & Data Privacy
* **NFR-SEC-01**: User access tokens (JWT) must have a lifespan of **15 minutes**. Refresh tokens are stored inside secure `HttpOnly`, `SameSite=Strict` cookies to mitigate Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) vectors.
* **NFR-SEC-02**: All communication between client and monolith must traverse encrypted transport layers (TLS 1.3).
* **NFR-SEC-03**: All administrative routes (`/api/admin/**`) are strictly guarded behind role authorization checks on the Spring Boot monolith filter chain.

### 2.3 UX, Styling, and Accessibility
* **NFR-UX-01**: The client interface must utilize Tailwind CSS (v4) with a modern visual design, showcasing smooth transitions, glassmorphism accents, hover states, and clear loading indicators.
* **NFR-UX-02**: The interface must comply with WCAG AA accessibility standards, assuring a contrast ratio of at least 4.5:1 for body copy and complete keyboard navigation support.
* **NFR-UX-03**: Responsive layout support is mandatory, optimizing components across mobile, tablet, and widescreen desktop displays.

### 2.4 Operational & Scaling
* **NFR-OPS-01**: Database bulk loading during TSV imports should operate asynchronously without blocking standard user query search traffic.
* **NFR-OPS-02**: The importer must handle large datasets efficiently using streaming IO and PostgreSQL JDBC `COPY` queries to avoid loading entire TSV contents into JVM memory.
