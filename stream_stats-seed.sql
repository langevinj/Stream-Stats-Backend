-- Seed test data for database

INSERT INTO users (username, password, email, band_name, is_admin)
VALUES('testuser',
        'testpwd123',
        'test@test.com',
        'Dunce Cap',
        FALSE);

INSERT INTO distrokid (username, reporting_month, sale_month, store, title, quantity, release_type, paid, sale_country, earnings)
VALUES('testuser', 'Mar 2020', 'Feb 2020', 'Apple Music', 'Test Track', 130, 'Song', 'n/a', 'US', 0.00456963323);