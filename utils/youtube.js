const puppeteer = require('puppeteer');

const validYTLink = async (value) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(value);
    
    return await new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                await page.$eval('.yt-player-error-message-renderer', el => !!el);
                resolve(false)
            } catch(e) {
                resolve(true)
            }
            await browser.close();
        }, 1500);
    })
}

const isYTLink = async (value) => {
    return value.includes('youtu') && await validYTLink(value)
}

module.exports = {
    isYTLink
}