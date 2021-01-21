'use strict'

//crawler for Spotify for artists
const puppeteer = require('puppeteer');
const fs = require('fs');
const { response } = require('express');

async function crawlSFA({ email, password, username } ) {

    // try {
    //institute a new browser instance
    const browser = await puppeteer.launch({
        headless: true,
        slowMo: 25,
        stealth: true
    });

    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
    });

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36');
    const C_OPTIMIZE = true;

    if (C_OPTIMIZE) {
        await page.setRequestInterception(true);
        const block_ressources = ['image', 'stylesheet', 'media', 'font', 'texttrack', 'object', 'beacon', 'csp_report', 'imageset'];
        page.on('request', request => {
            //if (request.resourceType() === 'image')
            if (block_ressources.indexOf(request.resourceType) > 0)
                request.abort();
            else
                request.continue();
        });
    }

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

    page.waitForTimeout(3000);

    //format the url properly to go to the correctly filtered page
    let filterIdx = await page.url().search('home');
    let filteredUrl = await page.url().substring(0, filterIdx);
    console.log(`filteredURL is ${filteredUrl}`)

    await page.waitForTimeout(2000);
    // page.goto(`${filteredUrl}music/songs?time-filter=28days`);

    // await page.waitForTimeout(1000);

    // navigate to stats page for last 28days
    await Promise.all([
        page.goto(`${filteredUrl}music/songs?time-filter=28days`),
        page.waitForSelector('tr[data-testid="sort-table-body-row"]')
    ]);

    await page.waitForTimeout(1000)

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
    
    // await page.waitForTimeout(1000);
    //write scraped data to a JSON file, if there is an error log it
    // await fs.writeFile(`./spotifyData/spotify-${username}-30days.json`, JSON.stringify(data), {flag: "w" }, err => err ? console.log(err): null);
    // console.log("30day stats written");

    await page.waitForTimeout(2000);

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
    // await fs.writeFile(`./spotifyData/spotify-${username}-allTime.json`, JSON.stringify(allData), err => err ? console.log(err) : null);
    // console.log("All-time stats written");

    await page.waitForTimeout(1000);
    let respData = { "30days": data, "allTime": allData }

    await page.waitForTimeout(100);
    browser.close();
    return JSON.stringify(respData);
// } catch (err) {
//     console.log(err)
// }
}

module.exports = { crawlSFA };