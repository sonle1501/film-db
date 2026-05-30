
-- 1. Auth Table
CREATE TABLE users.user_auth (
    user_id UUID PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20),
    user_state VARCHAR(20) DEFAULT 'ACTIVE'
);

-- 2. Refresh Token Table
CREATE TABLE users.refresh_token (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_refresh_token_user_auth FOREIGN KEY (user_id) REFERENCES users.user_auth (user_id) ON DELETE CASCADE
);

-- 3. User Profile Table
CREATE TABLE users.user_profile (
    user_id UUID PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    bio TEXT,
    display_name VARCHAR(100),
    avatar_url TEXT,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_user_profile_user_auth FOREIGN KEY (user_id) REFERENCES users.user_auth (user_id) ON DELETE CASCADE
);

-- 4. User List Table
CREATE TABLE users.user_list (
    list_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name_list VARCHAR(100) NOT NULL,
    list_type VARCHAR(20) DEFAULT 'MIXTURE',
    is_custom BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_list_name UNIQUE (user_id, name_list, list_type),
    CONSTRAINT fk_user_list_user_auth FOREIGN KEY (user_id) REFERENCES users.user_auth (user_id) ON DELETE CASCADE
);

-- 5. List Items Details Table
CREATE TABLE users.user_list_details (
    item_id UUID PRIMARY KEY,
    list_id UUID NOT NULL,
    movie_id VARCHAR(15) NOT NULL,
    state VARCHAR(20) DEFAULT 'NEUTRAL',
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    CONSTRAINT unique_list_movie UNIQUE (list_id, movie_id),
    CONSTRAINT fk_user_list_details_user_list FOREIGN KEY (list_id) REFERENCES users.user_list (list_id) ON DELETE CASCADE
);
