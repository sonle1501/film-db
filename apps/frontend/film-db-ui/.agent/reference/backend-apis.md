{
  "openapi": "3.1.0",
  "info": {
    "title": "OpenAPI definition",
    "version": "v0"
  },
  "servers": [
    {
      "url": "http://localhost:8080",
      "description": "Generated server url"
    }
  ],
  "paths": {
    "/api/v1/users/lists/{list-id}/public": {
      "put": {
        "tags": [
          "user-list-controller"
        ],
        "operationId": "setListPublic",
        "parameters": [
          {
            "name": "list-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/users/lists/{list-id}/private": {
      "put": {
        "tags": [
          "user-list-controller"
        ],
        "operationId": "setListPrivate",
        "parameters": [
          {
            "name": "list-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/users/lists/{list-id}/custom": {
      "put": {
        "tags": [
          "user-list-controller"
        ],
        "operationId": "toggleIsCustomOfList",
        "parameters": [
          {
            "name": "list-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/user/profile/username": {
      "put": {
        "tags": [
          "user-controller"
        ],
        "operationId": "changeUsername",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ChangeUsernameRequestDto"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/admin/users/{user-id}/state/ban": {
      "put": {
        "tags": [
          "admin-users-controller"
        ],
        "operationId": "banUser",
        "parameters": [
          {
            "name": "user-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/admin/users/{user-id}/state/active": {
      "put": {
        "tags": [
          "admin-users-controller"
        ],
        "operationId": "activeUser",
        "parameters": [
          {
            "name": "user-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/users/lists": {
      "get": {
        "tags": [
          "user-list-controller"
        ],
        "operationId": "getListsByName",
        "parameters": [
          {
            "name": "nameList",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/UserListDto"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "tags": [
          "user-list-controller"
        ],
        "operationId": "createListWithMetadata",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ListMetadataForCreateDto"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      },
      "patch": {
        "tags": [
          "user-list-controller"
        ],
        "operationId": "updateUserListMetadata",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ListMetadataForPatchUpdateDto"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/users/lists/{list-id}/item": {
      "post": {
        "tags": [
          "user-list-details-controller"
        ],
        "operationId": "addListItem",
        "parameters": [
          {
            "name": "list-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ItemMetadataForCreateDto"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      },
      "patch": {
        "tags": [
          "user-list-details-controller"
        ],
        "operationId": "updateMetadataListItem",
        "parameters": [
          {
            "name": "list-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ItemMetadataForPatchUpdateDto"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/users/lists/system-list": {
      "post": {
        "tags": [
          "user-list-controller"
        ],
        "operationId": "createSystemListWithType",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/IdNameAndTypeDto"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/users/lists/simple-list": {
      "post": {
        "tags": [
          "user-list-controller"
        ],
        "operationId": "createSimpleList",
        "parameters": [
          {
            "name": "nameList",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/register": {
      "post": {
        "tags": [
          "auth-controller"
        ],
        "operationId": "register",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RegisterRequestDto"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/TokenResponseDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/register/admin": {
      "post": {
        "tags": [
          "auth-controller"
        ],
        "operationId": "registerAdmin",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/RegisterRequestDto"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/TokenResponseDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/refresh": {
      "post": {
        "tags": [
          "auth-controller"
        ],
        "operationId": "refresh",
        "parameters": [
          {
            "name": "refresh_jwt",
            "in": "cookie",
            "required": false,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/TokenResponseDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/auth/logout": {
      "post": {
        "tags": [
          "auth-controller"
        ],
        "operationId": "logout",
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/auth/login": {
      "post": {
        "tags": [
          "auth-controller"
        ],
        "operationId": "login",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/LoginRequestDto"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/TokenResponseDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/admin/job/reject-admin": {
      "post": {
        "tags": [
          "admin-job-controller"
        ],
        "operationId": "rejectAdmin",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/admin/job/approve-admin": {
      "post": {
        "tags": [
          "admin-job-controller"
        ],
        "operationId": "approveAdmin",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/user/profile": {
      "get": {
        "tags": [
          "user-controller"
        ],
        "operationId": "getUserProfile",
        "parameters": [
          {
            "name": "username",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/UserInfoDto"
                }
              }
            }
          }
        }
      },
      "patch": {
        "tags": [
          "user-controller"
        ],
        "operationId": "updateUserProfileMetadata",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/UserProfileMetadataUpdateDto"
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/users/lists/{list-id}": {
      "get": {
        "tags": [
          "user-list-controller"
        ],
        "operationId": "getListById",
        "parameters": [
          {
            "name": "list-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/UserListDto"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "user-list-controller"
        ],
        "operationId": "deleteListById",
        "parameters": [
          {
            "name": "list-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/users/lists/{list-id}/items": {
      "get": {
        "tags": [
          "user-list-details-controller"
        ],
        "operationId": "getAllListItems",
        "parameters": [
          {
            "name": "list-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/ListItemDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/users/lists/{list-id}/item/{item-id}": {
      "get": {
        "tags": [
          "user-list-details-controller"
        ],
        "operationId": "getListItem",
        "parameters": [
          {
            "name": "list-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "item-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/ListItemDto"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "user-list-details-controller"
        ],
        "operationId": "removeListItem",
        "parameters": [
          {
            "name": "list-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "item-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/users/lists/all": {
      "get": {
        "tags": [
          "user-list-controller"
        ],
        "operationId": "getAllUserLists",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/UserListDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/search": {
      "get": {
        "tags": [
          "hello"
        ],
        "operationId": "getSearchResult",
        "parameters": [
          {
            "name": "name",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/search/{id}": {
      "get": {
        "tags": [
          "hello"
        ],
        "operationId": "getHello",
        "parameters": [
          {
            "name": "rid",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/tvseries/{film-id}/seasons": {
      "get": {
        "tags": [
          "tv-series-controller"
        ],
        "operationId": "getSeasons",
        "parameters": [
          {
            "name": "film-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "integer",
                  "format": "int32"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/tvseries/{film-id}/episodes": {
      "get": {
        "tags": [
          "tv-series-controller"
        ],
        "operationId": "getEpisodesBySeason",
        "parameters": [
          {
            "name": "film-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "season",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/EpisodeInfoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/tvseries/{film-id}/by-name": {
      "get": {
        "tags": [
          "tv-series-controller"
        ],
        "operationId": "getTvSeriesByName",
        "parameters": [
          {
            "name": "film-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "name",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MovieBasicInfoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/tvseries/{episode-id}": {
      "get": {
        "tags": [
          "tv-series-controller"
        ],
        "operationId": "getEpisode",
        "parameters": [
          {
            "name": "episode-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/EpisodeInfoDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/person/{person-id}": {
      "get": {
        "tags": [
          "person-controller"
        ],
        "operationId": "getPersonBasicInfo",
        "parameters": [
          {
            "name": "person-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/PersonInfoDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/person/{person-id}/details": {
      "get": {
        "tags": [
          "person-controller"
        ],
        "operationId": "getPersonDetails",
        "parameters": [
          {
            "name": "person-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/PersonDetailsDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/person/{person-id}/career": {
      "get": {
        "tags": [
          "person-controller"
        ],
        "operationId": "getPersonCareer",
        "parameters": [
          {
            "name": "person-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MovieBasicInfoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/listfilm/top-rated-tvseries": {
      "get": {
        "tags": [
          "movie-list-controller"
        ],
        "operationId": "getTopRatedTvSeries",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MovieRatingInfoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/listfilm/top-rated-movies": {
      "get": {
        "tags": [
          "movie-list-controller"
        ],
        "operationId": "getTopRatedMovies",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MovieRatingInfoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/listfilm/recent": {
      "get": {
        "tags": [
          "movie-list-controller"
        ],
        "operationId": "getListMovieRecent",
        "parameters": [
          {
            "name": "year",
            "in": "query",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MovieBasicInfoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/listfilm/rating/{rating}": {
      "get": {
        "tags": [
          "movie-list-controller"
        ],
        "operationId": "getListMovieFilterByRating",
        "parameters": [
          {
            "name": "rating",
            "in": "path",
            "required": true,
            "schema": {
              "type": "number",
              "format": "double"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MovieRatingInfoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/listfilm/popular-movies": {
      "get": {
        "tags": [
          "movie-list-controller"
        ],
        "operationId": "getMostPopularMovies",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MovieRatingInfoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/listfilm/localized": {
      "get": {
        "tags": [
          "movie-list-controller"
        ],
        "operationId": "getListMovieUseLocalizedName",
        "parameters": [
          {
            "name": "name",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MovieSupplementInfoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/listfilm/by-name": {
      "get": {
        "tags": [
          "movie-list-controller"
        ],
        "operationId": "getListMovieFilterByName",
        "parameters": [
          {
            "name": "name",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MovieBasicInfoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/listfilm/by-name-limit": {
      "get": {
        "tags": [
          "movie-list-controller"
        ],
        "operationId": "getListMovieFilterByNameWithLimit",
        "parameters": [
          {
            "name": "name",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "page",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 0
            }
          },
          {
            "name": "size",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/PageMovieBasicInfoDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/listfilm/by-name-and-type": {
      "get": {
        "tags": [
          "movie-list-controller"
        ],
        "operationId": "getListMovieFilterByNameAndType",
        "parameters": [
          {
            "name": "name",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "type",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MovieBasicInfoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/listfilm/by-name-and-genre": {
      "get": {
        "tags": [
          "movie-list-controller"
        ],
        "operationId": "getListMovieFilterByNameAndGenre",
        "parameters": [
          {
            "name": "name",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "genre",
            "in": "query",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MovieBasicInfoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/film/{film-id}": {
      "get": {
        "tags": [
          "movie-controller"
        ],
        "operationId": "getMovieBasicInfo",
        "parameters": [
          {
            "name": "film-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/MovieBasicInfoDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/film/{film-id}/people": {
      "get": {
        "tags": [
          "movie-controller"
        ],
        "operationId": "getMoviePeople",
        "parameters": [
          {
            "name": "film-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/MoviePersonInfoDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/film/{film-id}/crew": {
      "get": {
        "tags": [
          "movie-controller"
        ],
        "operationId": "getMovieCrewInfo",
        "parameters": [
          {
            "name": "film-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/MovieCrewInfoDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/film/rating/{film-id}": {
      "get": {
        "tags": [
          "movie-controller"
        ],
        "operationId": "getMovieRatingInfo",
        "parameters": [
          {
            "name": "film-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/MovieRatingInfoDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/film/full/{film-id}": {
      "get": {
        "tags": [
          "movie-controller"
        ],
        "operationId": "getMovieFullInfo",
        "parameters": [
          {
            "name": "film-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/MovieFullInfoDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/imdb/film/alternative/{film-id}": {
      "get": {
        "tags": [
          "movie-controller"
        ],
        "operationId": "getMovieSupplementInfo",
        "parameters": [
          {
            "name": "film-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/MovieSupplementInfoDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/admin/world": {
      "get": {
        "tags": [
          "import-controller"
        ],
        "operationId": "run",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/api/admin/users/{user-id}/user-info": {
      "get": {
        "tags": [
          "admin-users-controller"
        ],
        "operationId": "getUserInfo",
        "parameters": [
          {
            "name": "user-id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "$ref": "#/components/schemas/UserInfoProjection"
                }
              }
            }
          }
        }
      }
    },
    "/api/admin/users/user-infos": {
      "get": {
        "tags": [
          "admin-users-controller"
        ],
        "operationId": "getAllUserInfos",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/UserInfoProjection"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/admin/userlist/{userId}/lists": {
      "get": {
        "tags": [
          "admin-user-list-controller"
        ],
        "operationId": "getUserListsByUserId",
        "parameters": [],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/UserListProjection"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/admin/userlist/all-lists": {
      "get": {
        "tags": [
          "admin-user-list-controller"
        ],
        "operationId": "getAllUserList",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/UserListProjection"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/admin/job/pending-tasks": {
      "get": {
        "tags": [
          "admin-job-controller"
        ],
        "operationId": "getPendingTasks",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/PendingRequestDto"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/admin/import-pipeline": {
      "get": {
        "tags": [
          "import-controller"
        ],
        "operationId": "adminRunImport",
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "ChangeUsernameRequestDto": {
        "type": "object",
        "properties": {
          "username": {
            "type": "string"
          },
          "password": {
            "type": "string"
          },
          "newUsername": {
            "type": "string"
          }
        }
      },
      "ListMetadataForCreateDto": {
        "type": "object",
        "properties": {
          "nameList": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "isPublic": {
            "type": "boolean"
          }
        }
      },
      "ItemMetadataForCreateDto": {
        "type": "object",
        "properties": {
          "movieId": {
            "type": "string"
          },
          "state": {
            "type": "string"
          },
          "notes": {
            "type": "string"
          }
        }
      },
      "IdNameAndTypeDto": {
        "type": "object",
        "properties": {
          "userId": {
            "type": "string",
            "format": "uuid"
          },
          "nameList": {
            "type": "string"
          },
          "type": {
            "type": "string"
          }
        }
      },
      "RegisterRequestDto": {
        "type": "object",
        "properties": {
          "username": {
            "type": "string"
          },
          "password": {
            "type": "string"
          }
        }
      },
      "TokenResponseDto": {
        "type": "object",
        "properties": {
          "token": {
            "type": "string"
          }
        }
      },
      "LoginRequestDto": {
        "type": "object",
        "properties": {
          "username": {
            "type": "string"
          },
          "password": {
            "type": "string"
          }
        }
      },
      "ListMetadataForPatchUpdateDto": {
        "type": "object",
        "properties": {
          "userId": {
            "type": "string",
            "format": "uuid"
          },
          "listId": {
            "type": "string",
            "format": "uuid"
          },
          "nameList": {
            "type": "string"
          },
          "isPublic": {
            "type": "boolean"
          },
          "isCustom": {
            "type": "boolean"
          },
          "listType": {
            "type": "string",
            "enum": [
              "PLAN_TO_WATCH",
              "WATCHING",
              "WATCHED",
              "LIKED",
              "LOVED",
              "HATED",
              "MIXTURE"
            ]
          }
        }
      },
      "ItemMetadataForPatchUpdateDto": {
        "type": "object",
        "properties": {
          "itemId": {
            "type": "string",
            "format": "uuid"
          },
          "state": {
            "type": "string"
          },
          "notes": {
            "type": "string"
          }
        }
      },
      "UserProfileMetadataUpdateDto": {
        "type": "object",
        "properties": {
          "bio": {
            "type": "string"
          },
          "displayName": {
            "type": "string"
          }
        }
      },
      "UserListDto": {
        "type": "object",
        "properties": {
          "listId": {
            "type": "string",
            "format": "uuid"
          },
          "userId": {
            "type": "string",
            "format": "uuid"
          },
          "nameList": {
            "type": "string"
          },
          "listType": {
            "type": "string",
            "enum": [
              "PLAN_TO_WATCH",
              "WATCHING",
              "WATCHED",
              "LIKED",
              "LOVED",
              "HATED",
              "MIXTURE"
            ]
          },
          "isCustom": {
            "type": "boolean"
          },
          "isPublic": {
            "type": "boolean"
          },
          "dateCreated": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "ListItemDto": {
        "type": "object",
        "properties": {
          "itemId": {
            "type": "string",
            "format": "uuid"
          },
          "listId": {
            "type": "string",
            "format": "uuid"
          },
          "movieId": {
            "type": "string"
          },
          "state": {
            "type": "string",
            "enum": [
              "PLAN_TO_WATCH",
              "WATCHING",
              "WATCHED",
              "LIKED",
              "LOVED",
              "HATED",
              "NEUTRAL"
            ]
          },
          "notes": {
            "type": "string"
          }
        }
      },
      "UserInfoDto": {
        "type": "object",
        "properties": {
          "userId": {
            "type": "string",
            "format": "uuid"
          },
          "displayName": {
            "type": "string"
          },
          "username": {
            "type": "string"
          },
          "dateCreated": {
            "type": "string",
            "format": "date-time"
          },
          "bio": {
            "type": "string"
          },
          "role": {
            "type": "string"
          },
          "userState": {
            "type": "string"
          }
        }
      },
      "EpisodeInfoDto": {
        "type": "object",
        "properties": {
          "episodeId": {
            "type": "string"
          },
          "parentMovieId": {
            "type": "string"
          },
          "seasonNumber": {
            "type": "integer",
            "format": "int32"
          },
          "episodeNumber": {
            "type": "integer",
            "format": "int32"
          },
          "primaryTitle": {
            "type": "string"
          },
          "originalTitle": {
            "type": "string"
          },
          "startYear": {
            "type": "integer",
            "format": "int32"
          },
          "runtimeMinutes": {
            "type": "integer",
            "format": "int32"
          }
        }
      },
      "MovieBasicInfoDto": {
        "type": "object",
        "properties": {
          "movieId": {
            "type": "string"
          },
          "primaryTitle": {
            "type": "string"
          },
          "originalTitle": {
            "type": "string"
          },
          "isAdult": {
            "type": "boolean"
          },
          "startYear": {
            "type": "integer",
            "format": "int32"
          },
          "runtimeMinutes": {
            "type": "integer",
            "format": "int32"
          },
          "genres": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "PersonInfoDto": {
        "type": "object",
        "properties": {
          "personId": {
            "type": "string"
          },
          "primaryName": {
            "type": "string"
          },
          "birthYear": {
            "type": "integer",
            "format": "int32"
          },
          "deathYear": {
            "type": "integer",
            "format": "int32"
          },
          "primaryProfession": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "knownForTitles": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "PersonDetailsDto": {
        "type": "object",
        "properties": {
          "personId": {
            "type": "string"
          },
          "primaryName": {
            "type": "string"
          },
          "primaryProfession": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "knownForTitles": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/MovieBasicInfoDto"
            }
          }
        }
      },
      "MovieRatingInfoDto": {
        "type": "object",
        "properties": {
          "movieId": {
            "type": "string"
          },
          "primaryTitle": {
            "type": "string"
          },
          "originalTitle": {
            "type": "string"
          },
          "isAdult": {
            "type": "boolean"
          },
          "startYear": {
            "type": "integer",
            "format": "int32"
          },
          "runtimeMinutes": {
            "type": "integer",
            "format": "int32"
          },
          "genres": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "averageRating": {
            "type": "number"
          },
          "numVotes": {
            "type": "integer",
            "format": "int32"
          }
        }
      },
      "LocalizedTitle": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string"
          },
          "region": {
            "type": "string"
          },
          "language": {
            "type": "string"
          }
        }
      },
      "MovieSupplementInfoDto": {
        "type": "object",
        "properties": {
          "movieId": {
            "type": "string"
          },
          "localizedTitles": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/LocalizedTitle"
            }
          }
        }
      },
      "PageMovieBasicInfoDto": {
        "type": "object",
        "properties": {
          "totalPages": {
            "type": "integer",
            "format": "int32"
          },
          "totalElements": {
            "type": "integer",
            "format": "int64"
          },
          "size": {
            "type": "integer",
            "format": "int32"
          },
          "content": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/MovieBasicInfoDto"
            }
          },
          "number": {
            "type": "integer",
            "format": "int32"
          },
          "sort": {
            "$ref": "#/components/schemas/SortObject"
          },
          "first": {
            "type": "boolean"
          },
          "last": {
            "type": "boolean"
          },
          "numberOfElements": {
            "type": "integer",
            "format": "int32"
          },
          "pageable": {
            "$ref": "#/components/schemas/PageableObject"
          },
          "empty": {
            "type": "boolean"
          }
        }
      },
      "PageableObject": {
        "type": "object",
        "properties": {
          "offset": {
            "type": "integer",
            "format": "int64"
          },
          "sort": {
            "$ref": "#/components/schemas/SortObject"
          },
          "paged": {
            "type": "boolean"
          },
          "pageNumber": {
            "type": "integer",
            "format": "int32"
          },
          "pageSize": {
            "type": "integer",
            "format": "int32"
          },
          "unpaged": {
            "type": "boolean"
          }
        }
      },
      "SortObject": {
        "type": "object",
        "properties": {
          "empty": {
            "type": "boolean"
          },
          "sorted": {
            "type": "boolean"
          },
          "unsorted": {
            "type": "boolean"
          }
        }
      },
      "MoviePersonInfoDto": {
        "type": "object",
        "properties": {
          "personId": {
            "type": "string"
          },
          "primaryName": {
            "type": "string"
          },
          "birthYear": {
            "type": "integer",
            "format": "int32"
          },
          "deathYear": {
            "type": "integer",
            "format": "int32"
          },
          "category": {
            "type": "string"
          },
          "job": {
            "type": "string"
          },
          "characters": {
            "type": "string"
          }
        }
      },
      "MovieCrewInfoDto": {
        "type": "object",
        "properties": {
          "movieId": {
            "type": "string"
          },
          "directors": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/PersonBasicInfoDto"
            }
          },
          "writers": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/PersonBasicInfoDto"
            }
          }
        }
      },
      "PersonBasicInfoDto": {
        "type": "object",
        "properties": {
          "personId": {
            "type": "string"
          },
          "primaryName": {
            "type": "string"
          },
          "birthYear": {
            "type": "integer",
            "format": "int32"
          },
          "deathYear": {
            "type": "integer",
            "format": "int32"
          }
        }
      },
      "MovieFullInfoDto": {
        "type": "object",
        "properties": {
          "movieId": {
            "type": "string"
          },
          "primaryTitle": {
            "type": "string"
          },
          "originalTitle": {
            "type": "string"
          },
          "isAdult": {
            "type": "boolean"
          },
          "startYear": {
            "type": "integer",
            "format": "int32"
          },
          "runtimeMinutes": {
            "type": "integer",
            "format": "int32"
          },
          "genres": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "averageRating": {
            "type": "number"
          },
          "numVotes": {
            "type": "integer",
            "format": "int32"
          },
          "persons": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/MoviePersonInfoDto"
            }
          }
        }
      },
      "UserInfoProjection": {
        "type": "object",
        "properties": {
          "userId": {
            "type": "string",
            "format": "uuid"
          },
          "displayName": {
            "type": "string"
          },
          "username": {
            "type": "string"
          },
          "dateCreated": {
            "type": "string",
            "format": "date-time"
          },
          "bio": {
            "type": "string"
          },
          "role": {
            "type": "string"
          },
          "userState": {
            "type": "string"
          }
        }
      },
      "UserListProjection": {
        "type": "object",
        "properties": {
          "listId": {
            "type": "string",
            "format": "uuid"
          },
          "userId": {
            "type": "string",
            "format": "uuid"
          },
          "nameList": {
            "type": "string"
          },
          "listType": {
            "type": "string"
          },
          "isPublic": {
            "type": "boolean"
          },
          "isCustom": {
            "type": "boolean"
          },
          "dateCreated": {
            "type": "string",
            "format": "date-time"
          }
        }
      },
      "PendingRequestDto": {
        "type": "object",
        "properties": {
          "taskId": {
            "type": "string",
            "format": "uuid"
          },
          "initiator": {
            "type": "string",
            "format": "uuid"
          },
          "targetEntityId": {
            "type": "string"
          },
          "actionType": {
            "type": "string",
            "enum": [
              "BAN_USER",
              "DELETE_MALICIOUS_LIST",
              "FORCE_LOGOUT",
              "ADMIN_APPROVAL",
              "IMPORT_DATASET"
            ]
          },
          "state": {
            "type": "string",
            "enum": [
              "PENDING",
              "APPROVED",
              "REJECTED",
              "CANCELLED"
            ]
          },
          "description": {
            "type": "string"
          },
          "priority": {
            "type": "integer",
            "format": "int32"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          }
        }
      }
    }
  }
}