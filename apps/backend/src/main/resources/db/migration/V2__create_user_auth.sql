CREATE TABLE users.user_auth (
                                 id SERIAL PRIMARY KEY,
                                 username VARCHAR(50) not null ,
                                 password_hash TEXT not null ,
                                 role CHAR(10)
);