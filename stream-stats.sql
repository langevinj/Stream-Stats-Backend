\echo 'Delete and recreate jobly db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE stream_stats;
CREATE DATABASE stream_stats;
\connect stream_stats;

-- \i stream_stats-schema.sql
-- \i stream_stats-seed.sql

\echo 'Delete and recreate stream_stats_test?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE stream_stats_test;
CREATE DATABASE stream_stats_test;
\connect stream_stats_test;

-- \i stream_stats-schema.sql