const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://capitadiscovery.co.uk/islington/account');

  // enter deets
  await page.type('#borrowerBarcodeTextBox', '20120007905567');
  await page.type('#pinTextBox', '1991');

  // login
  await page.evaluate( () =>
  {
    Array.from( document.querySelectorAll('input') ).filter( element => element.name === 'borrowerLoginButton' )[0].click();
  });

  await page.waitForNavigation();

  // get renewal dates
  // todo: get loan rows
  const tds = await page.evaluate(() => {
    const anchors = document.getElementsByClassName('accDue');
    return [].map.call(anchors, a => a.innerText);
  });

  console.log(tds);

  // filter those due in next 5 days

  // if one has reached max renewals, log it
  // loans.each((l) => l.)

  // renew all that can be renewed
  // await page.click()

  // check none due in next 5 days



  await page.screenshot({path: 'screenshots/loans.png'});

  await browser.close();
})();
