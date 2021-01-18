//crawler for Spotify for artists
const puppeteer = require('puppeteer');
const fs = require('fs');

async function crawlSFA({ email, password, username } ) {
    //institute a new browser instance
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 10
    });

    const page = await browser.newPage();
    //go to the spotify for artists login page
    await page.goto('https://accounts.spotify.com/en/login?continue=https:%2F%2Fartists.spotify.com%2F');

    //login the user
    await page.type('#login-username', email);
    await page.type('#login-password', password);

    //click the login button and wait for the new page to load
    await Promise.all([
        page.click('#login-button'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    
    await page.waitForTimeout(3000)

    //format the url properly to go to the correctly filtered page
    let filterIdx = page.url().search('home');
    let filteredUrl = page.url().substring(0, filterIdx);

    //navigate to stats page for last 28days
    await Promise.all([
        page.goto(`${filteredUrl}music/songs?time-filter=28day`),
        page.waitForSelector('tr[data-testid="sort-table-body-row"]')
    ]);

    //get data about past 28 days streams from the browser
    const data = await page.$$eval('tr[data-testid="sort-table-body-row"]', $song => {
        const scrapedData = [];

        $song.forEach(function ($song) {
            scrapedData.push({
                title: $song.querySelector('span[class*="Title').innerText,
                streams: $song.childNodes[3].title,
                listeners: $song.childNodes[4].title
            });
            return
        });

        return scrapedData;
    });
    
    await page.waitForTimeout(1000);
    //write scraped data to a JSON file, if there is an error log it
    await fs.writeFile(`./spotifyData/spotify-${username}-30days.json`, JSON.stringify(data), {flag: "w" }, err => err ? console.log(err): null);
    console.log("30day stats written");

    await page.waitForTimeout(1000);

    //visit all time stats
    await Promise.all([
        page.goto(`${filteredUrl}music/songs?time-filter=all`),
        page.waitForSelector('tr[data-testid="sort-table-body-row"]')
    ]);

    const allData = await page.$$eval('tr[data-testid="sort-table-body-row"]', $song => {
        const scrapedData = [];

        $song.forEach(function ($song) {
            scrapedData.push({
                title: $song.querySelector('span[class*="Title').innerText,
                streams: $song.childNodes[3].title,
                listeners: $song.childNodes[4].title
            });
            return
        });

        return scrapedData;
    });

    //write scraped data to a JSON file, if there is an error log it
    await fs.writeFile(`./spotifyData/spotify-${username}-allTime.json`, JSON.stringify(allData), err => err ? console.log(err) : null);
    console.log("All-time stats written");

    await page.waitForTimeout(1000);

    browser.close();
}

module.exports = { crawlSFA };