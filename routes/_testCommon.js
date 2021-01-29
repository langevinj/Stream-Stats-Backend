"use strict";

const db = require("../db.js");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
    await db.query("DELETE FROM users");
    await db.query("DELETE FROM bandcamp_all_time");
    await db.query("DELETE FROM bandcamp_running");
    await db.query("DELETE FROM distrokid");
    await db.query("DELETE FROM spotify_all_time");
    await db.query("DELETE FROM spotify_running");

    await User.register({
        username: "u1",
        email: "user1@user.com",
        password: "password1",
        bandName: "band1",
        isAdmin: false
    });
    await User.register({
        username: "u2",
        email: "user2@user.com",
        password: "password2",
        bandName: "band2",
        isAdmin: false
    });
    await User.register({
        username: "u3",
        email: "user3@user.com",
        password: "password3",
        bandName: "band3",
        isAdmin: false
    });

    await db.query(`
        INSERT INTO bandcamp_all_time(title, plays, username)
        VALUES ('song1', $1, 'u1'),
               ('song2', $2, 'u1'),
               ('song3', $3, 'u2')`,
        [100, 200, 300]);

    await db.query(`
        INSERT INTO bandcamp_running(title, plays, username)
        VALUES ('song1', $1, 'u1'),
               ('song2', $2, 'u1'),
               ('song3', $3, 'u2')`,
        [15, 25, 55]);

    await db.query(`
        INSERT INTO distrokid(reporting_month, sale_month, store, title, quantity, release_type, sale_country, earnings, username)
        VALUES ('2019-10-24', '2019-09-30', 'applemusic', 'song1', $1, 'Song', 'US', $2, 'u1')`, [15, 0.0097586308]);

    await db.query(`
        INSERT INTO spotify_all_time(title, streams, username)
        VALUES ('song1', $1, 'u1'),
                ('song2', $2, 'u1'),
                ('song3', $3, 'u1'),
                ('song4', $4, 'u2')`, [1400, 2000, 50, 300]);

    await db.query(`
        INSERT INTO spotify_running(title, streams, username)
        VALUES ('song1', $1, 'u1'),
                ('song2', $2, 'u1'),
                ('song3', $3, 'u1'),
                ('song4', $4, 'u2')`, [200, 300, 50, 100]);
}

async function commonBeforeEach() {
    await db.query("BEGIN");
}

async function commonAfterEach() {
    await db.query("ROLLBACK");
}

async function commonAfterAll() {
    await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmim: false });
const adminToken = createToken({ username: "admin", isAdmin: true });

const bandcampMonthTestData = `No file chosen
Upload Custom Header
975 pixels wide, 40 - 180 pixels tall, .jpg, .gif or.png, 2mb max
Plays Sales Sources Map
all - time 60 days 30 days 7 days today defender
December 31, 2020 - January 29, 202110 plays
Dec 31 '20Jan 29 '21Dec 25Dec 1Dec 16Jan 1Jan 162110
track top ten / all	plays		complete partial skip in Bandcamp from embeds
Total plays	10
1 	 3 	 6
10
1.
Song1	2
2
2
2.
Song2	1		
1
1	
3.	
Song3	1		
1
1	
4.	
Song4	1		
1		
1	
5.	
Song5	1		
1
1	
6.	
Song6	1		
1
1	
7.	
Song7	1		
1
1	
8.	
Song8	1		
 1	
1	
9.	
Song9	1		
1
1	
A “complete” play means the track was played past the 90 % mark.A “partial” play means the track was played past the 10 % mark, but stopped before the 90 % mark.A “skip” means the track was stopped before the 10 % mark.
Your own plays(while logged in) don’t count toward your stats.
Stats are calculated based on Coordinated Universal Time(UTC).
terms of use privacy copyright policy help`

const distrokidTestData = `UPLOAD
MY MUSIC
TEAMS
STATS
UPGRADE
BANK
MORE
▼

All dates
 
Test Band
 
All releases
 
All stores
 DISPLAY 
REPORTING MONTH	SALE MONTH	STORE	ARTIST	TITLE	QUANTITY	SONG/ALBUM	CUSTOMER PAID	COUNTRY OF SALE	EARNINGS (USD)
Oct 2019	Sep 2019	Apple Music	Test Band	Test Song	1	Song	n/a	US	$0.009350790340
100% of team
Oct 2019	Sep 2019	Apple Music	Test Band	Test Song 2	9	Song	n/a	US	$0.031094302814
100% of team
Nov 2019	Sep 2019	Spotify	Test Band	Test Song 2	3	Song	n/a	US	$0.016208874159
100% of team
Nov 2019	Sep 2019	Spotify	Test Band	Test Song 	1	Song	n/a	US	$0.002925977284
100% of team
Dec 2019	Oct 2019	Apple Music	Test Band	Test Song 	1	Song	n/a	US	$0.004985070202
Total	$5.86
Grand total	$5.86
Some info about earnings

"N/a" in the "customer paid" column means that the customer didn't pay anything (example: Spotify streaming) or the store didn't tell us how much the customer paid (example: Amazon).

The amount owed to you is rounded down to the nearest hundredth (1-cent). Fractions of cents will remain in your account however, so you should get them as they add up (unlike the plot of Office Space and Superman 3).
Support Center - Got questions?
DistroKid News - What's new with us
Instagram - Watch our 1-minute help videos!
Twitter - We tweet things sometimes
Facebook - Let's be friends
YouTube - More videos, yo.

Privacy policy
Cookie policy
Cookie settings
Terms of use
Distribution agreement
© DistroKid 2021`

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    adminToken,
    bandcampMonthTestData,
    distrokidTestData
};