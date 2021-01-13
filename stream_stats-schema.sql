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
    username VARCHAR(25) 
        REFERENCES users ON DELETE CASCADE,
    reporting_month TEXT NOT NULL,
    sale_month TEXT NOT NULL,
    store TEXT NOT NULL,
    title TEXT NOT NULL,
    quantity INTEGER,
    release_type TEXT NOT NULL,
    paid TEXT,
    sale_country TEXT NOT NULL,
    earnings NUMERIC,
    PRIMARY KEY username
);