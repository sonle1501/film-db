-- drop old table
DROP TABLE users.user_auth;


-- 1. Auth Table
CREATE TABLE users.user_auth (
                                 user_id UUID PRIMARY KEY, -- Generated as v7 in Java or via extension
                                 username VARCHAR(50) NOT NULL UNIQUE,
                                 password_hash TEXT NOT NULL,
                                 role VARCHAR(50)
);

-- 2. Profile Table
CREATE TABLE users.user_profile (
                                    user_id UUID PRIMARY KEY, -- Same ID as user_auth
                                    bio TEXT,
                                    display_name VARCHAR(100),
                                    date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Dynamic Lists
CREATE TABLE users.user_list (
                                 list_id UUID PRIMARY KEY,
                                 user_id UUID NOT NULL,
                                 name_list VARCHAR(100) NOT NULL,
    -- remember to add: by_system BOOLEAN
                                 is_public BOOLEAN DEFAULT false
);

-- 4. List Items
CREATE TABLE users.user_list_details (
                                         item_id UUID PRIMARY KEY,
                                         list_id UUID NOT NULL,
                                         movie_id VARCHAR(50),
                                         added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                                         notes TEXT
);