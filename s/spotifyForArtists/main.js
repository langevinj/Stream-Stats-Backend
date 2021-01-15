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

    //find the correct url to visit for stats
    // const statsNav = await page.$eval('a[href*="/music/songs"]', $link => {
    //     const scrapedLink = [];

    //     scrapedLink.push($link.href)
    //     return scrapedLink
    // });
    
    //go to stats page, currently set to have the filter be past 28days
    // await Promise.all([
    //     page.click(`a[href*="/music/songs"]`),
    //     page.waitForSelector('tr[data-testid="sort-table-body-row"]')
    // ]);
    await page.waitForTimeout(3000)

    //format the url properly to go to the correctly filtered page
    let filterIdx = page.url().search('home');
    let filteredUrl = page.url().substring(0, filterIdx);

    await Promise.all([
        page.goto(`${filteredUrl}music/songs?time-filter=28day`),
        page.waitForSelector('tr[data-testid="sort-table-body-row"]')
    ]);

    console.log("MAde it to  url")
    

    //get data about streams from the browser
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

    //write scraped data to a JSON file, if there is an error log it
    await fs.writeFile(`spotify-${username}.json`, JSON.stringify(data), err => err ? console.log(err): null);

    await page.waitForTimeout(3000)

    browser.close();
}

module.exports = { crawlSFA };