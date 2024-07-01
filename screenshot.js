const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

(async function takeScreenshot() {

    

    // Set up Chrome options
    let options = new chrome.Options();
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--disable-web-security');
    options.addArguments('--allow-insecure-localhost');
    options.addArguments('--start-maximized');
    options.addArguments('--start-fullscreen');

    // Create a new WebDriver instance
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        // Navigate to the webpage
        await driver.get(loginUrl);

        // Wait until the page is loaded
        await driver.wait(until.elementLocated(By.name('username')), 10000);

        await driver.findElement(By.name('username')).sendKeys(username);
        await driver.findElement(By.name('password')).sendKeys(password);

        await driver.findElement(By.id('loginButton')).click();
        await driver.sleep(5000);

        // Take the screenshot
        await driver.get(devices);
        let mainPanel = await driver.findElement(By.css('#app-main-panel'));
        const totalHeight = await driver.executeScript('return arguments[0].scrollHeight', mainPanel);
        const viewportHeight = await driver.executeScript('return window.innerHeight');
        let screenshots = [];
        let scrollPosition = 0;

        while (scrollPosition < totalHeight) {
            await driver.executeScript(`arguments[0].scrollTop = ${scrollPosition}`, mainPanel);
            await driver.sleep(1000); 
            let screenshot = await mainPanel.takeScreenshot();
            screenshots.push(screenshot);
            scrollPosition += viewportHeight;
        }

        let fullPageScreenshot = Buffer.concat(screenshots.map(s => Buffer.from(s, 'base64')));

        // Save the full-page screenshot to a file
        fs.writeFileSync('fullPageScreenshot.png', fullPageScreenshot);
        console.log('Full-page screenshot saved as fullPageScreenshot.png');

        // let element = await driver.findElement(By.css('#app-main-panel > div > div > div.css-qlaqsc'));
        // let elementScreenshot = await element.takeScreenshot();
        // let screenshot = await driver.takeScreenshot();

        // Save the screenshot to a file
        // fs.writeFileSync('screenshot.png', elementScreenshot, 'base64');
        // console.log('Screenshot saved as screenshot.png');
    } finally {
        // Quit the WebDriver instance
        await driver.quit();
    }
})();
