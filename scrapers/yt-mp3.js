const YoutubeMp3Downloader = require('youtube-mp3-downloader');
const puppeteer = require('puppeteer');
const baseYTUrl = 'https://www.youtube.com'

const getVideoIDByLink = async (link) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(link);
    return await new Promise(async (resolve, reject) => {
        setTimeout(async () => {
            const ID = await page.$eval('ytd-watch-flexy', el => el.getAttribute('video-id'));
            await browser.close();
            resolve(ID);
        }, 1500)
    })
}

const getVideoIDBySearchValue = async (searchValue) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`${baseYTUrl}/results?search_query=${searchValue}`);
    return await new Promise((resolve, reject) => {
        setTimeout(async() => {
            const ID = await page.$$eval('a#video-title', videos => videos.map(video => video.getAttribute('href').slice(9)));
            await browser.close();
            resolve(ID);
        }, 1500)
    })
}

const downloadMP3 = async (videosIDs, i=0) => {
    const videoID = videosIDs[i]
    const YD = new YoutubeMp3Downloader({
        ffmpegPath: '/usr/bin/ffmpeg',
        outputPath: `${__dirname}/../downloaded/mp3`,
        youtubeVideoQuality: 'highestaudio',
        queueParallelism: 1,
        progressTimeout: 1000,
    })
    return await new Promise(async (resolve, reject) => {
        YD.download(videoID);
        YD.on('finished', (err, data) => {
            resolve(data);
        })
        YD.on('error', async (err, data) => {
            resolve(await downloadMP3(videosIDs, i+1))
        });
    })
}

module.exports = {
    getVideoIDByLink,
    getVideoIDBySearchValue,
    downloadMP3
}
