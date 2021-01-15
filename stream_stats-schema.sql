-- Database layout for stream stats app

CREATE TABLE users (
    username VARCHAR(25) PRIMARY KEY,
    password TEXT NOT NULL,
    email TEXT NOT NULL
        CHECK (position('@' IN email) > 1),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    band_name TEXT
);

CREATE TABLE distrokid (
    id SERIAL PRIMARY KEY,
    reporting_month DATE NOT NULL,
    sale_month DATE NOT NULL,
    store TEXT NOT NULL,
    title TEXT NOT NULL,
    quantity INTEGER,
    release_type TEXT NOT NULL,
    paid TEXT,
    sale_country TEXT NOT NULL,
    earnings NUMERIC,
    username VARCHAR(25) 
        REFERENCES users ON DELETE CASCADE
);

CREATE TABLE spotify_credentials (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL
        CHECK (position('@' IN email) > 1),
    password TEXT NOT NULL,
    username VARCHAR(25) 
        REFERENCES users ON DELETE CASCADE
);