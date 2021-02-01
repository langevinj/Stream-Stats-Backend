'use strict'

/** Crawler for Spotify for Artists.*/

const puppeteer = require('puppeteer');

async function crawlSFA({ email, password, username } ) {

    //Initiate a new browser instance.
    const browser = await puppeteer.launch({
        headless: true,
        slowMo: 25,
        stealth: true
    });

    const page = await browser.newPage();

    //Set page headers.
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
    });

    //Set a more "real" user agent.
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36');

    const C_OPTIMIZE = true;

    //Block unecessary resources to eliminate some means of crawler blocking.
    if (C_OPTIMIZE) {
        await page.setRequestInterception(true);
        const block_ressources = ['image', 'stylesheet', 'media', 'font', 'texttrack', 'object', 'beacon', 'csp_report', 'imageset'];
        page.on('request', request => {
            if (block_ressources.indexOf(request.resourceType) > 0)
                request.abort();
            else
                request.continue();
        });
    }

    //Go to the Spotify for Artists login page.
    await page.goto('https://accounts.spotify.com/en/login?continue=https:%2F%2Fartists.spotify.com%2F');

    //Login the user.
    await page.type('#login-username', email);
    await page.type('#login-password', password);

    await page.click('#login-button');

    //Check to make sure that the login was successful. If not, close the browser and indicator there was a login error.
    await page.waitForTimeout(5000);
    if (page.url() === 'https://accounts.spotify.com/en/login?continue=https:%2F%2Fartists.spotify.com%2F') {
        browser.close();
        return "LOGIN ERROR";
    } else {
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    //Format the url properly to go to the correctly filtered page.
    let filterIdx = await page.url().search('home');
    let filteredUrl = await page.url().substring(0, filterIdx);

    await page.waitForTimeout(1000);

    // Navigate to stats page for last 28days.
    await Promise.all([
        page.goto(`${filteredUrl}music/songs?time-filter=28days`),
        page.waitForSelector('tr[data-testid="sort-table-body-row"]')
    ]);

    await page.waitForTimeout(1000)

    //Get data about past 28 days of streams from the browser.
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

    //Visit the "All time" stats page.
    await Promise.all([
        page.goto(`${filteredUrl}music/songs?time-filter=all`),
        page.waitForSelector('tr[data-testid="sort-table-body-row"]')
    ]);


    //Get data about the All times stream from the browser.
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

    await page.waitForTimeout(1000);

    const respData = { "30days": data, "allTime": allData }

    await page.waitForTimeout(100);

    //Close the browser, return the stringified data.
    browser.close();
    return JSON.stringify(respData);
}

module.exports = { crawlSFA };