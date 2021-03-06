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

const distrokidTestData = `
Reporting Date	Sale Month	Store	Artist	Title	ISRC	UPC	Quantity	Team Percentage	Song/Album	Country of Sale	Songwriter Royalties Withheld	Earnings (USD)
2019-10-24	2019-09	applemusic	Test Band	Test Song	QZHN41992903		1	100	Song	US	0	0.00935079
2019-10-24	2019-09	applemusic	Test Band	Test Song	QZHN41992903		9	100	Song	US	0	0.03109430
2019-11-26	2019-09	spotify	Test Band	Test Song	QZHN41992903		3	100	Song	US	0	0.01620887
2019-11-26	2019-09	spotify	Test Band	Test Song	QZHN41992903		1	100	Song	US	0	0.00292598
2019-12-04	2019-10	applemusic	Test Band	Test Song	QZHN41992903		1	100	Song	US	0	0.00498507
2019-12-04	2019-10	applemusic	Test Band	Test Song	QZHN41992903		4	100	Song	US	0	0.01391220
2019-12-04	2019-10	applemusic	Test Band	Test Song	QZHN41992903		1	100	Song	AU	0	0.00910884`


const spotifyTestData = `
Skip to main page content

Test Band
Home
Music
Audience
Profile
Music
Songs
Releases
Playlists
Upcoming
Search
Search songs in your catalog
Last 28 days
#	TITLE		STREAMS	LISTENERS	VIEWS	SAVES	FIRST ADDED
1	

Song1
34	8 	—	4	30 Mar 2020
2	

Song 2
30	3 	—	—	30 Mar 2020
3	

Song 3
29	3 	—	—	30 Mar 2020
4	

Song/4
24	2 	—	—	19 Mar 2020
5	

Song 5
20	1 	—	—	30 Mar 2020
6	

Song 6
9	5 	—	—	16 Feb 2018
7	

Test Song
4	3 	—	—	16 Feb 2018
8	

Song 8
4	2 	—	—	16 Feb 2018
9	
Song 9
3	2 	—	—	16 Feb 2018
10	

Song 10
2	2 	—	—	16 Feb 2018
11	

Song11
1	1 	—	—	16 Feb 2018
Legal
Privacy
Cookies
© 2021 Spotify AB
`

module.exports = {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    u2Token,
    adminToken,
    bandcampMonthTestData,
    distrokidTestData,
    spotifyTestData
};