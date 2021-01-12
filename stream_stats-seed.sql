-- Seed test data for database

INSERT INTO users (username, password, email, band_name, is_admin)
VALUES('testuser',
        'testpwd123',
        'test@test.com',
        'Dunce Cap',
        FALSE);