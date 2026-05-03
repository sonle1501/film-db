
CREATE TABLE users.refresh_token (
                                     id UUID PRIMARY KEY,
                                     user_id UUID,
                                     token TEXT NOT NULL UNIQUE,
                                     expiry_date TIMESTAMP WITH TIME ZONE NOT NULL
);
