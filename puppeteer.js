"use strict";

require('dotenv').config();
const puppeteer = require('puppeteer');
const moment = require('moment');

const DAYS_SOON = 7;
const LIBRARY_WEBSITE = "https://capitadiscovery.co.uk/islington/account";


(async () => {
  console.log("👋 hello there\n")

  // Visit library website
  console.log("🚀 launching browser")
  const browser = await puppeteer.launch();
  console.log("🚶 heading over to the library\n")
  const page = await browser.newPage();
  await page.goto(LIBRARY_WEBSITE);


  // Log in 
  console.log("🔐 logging in")
  await page.type('#borrowerBarcodeTextBox', process.env.BORROWER_BARCODE);
  await page.type('#pinTextBox', process.env.PIN);

  await page.evaluate( () =>
  {
    Array.from( document.querySelectorAll('input') ).filter( element => element.name === 'borrowerLoginButton' )[0].click();
  });
  await page.waitForNavigation();
  console.log("✅ logged in!\n")


  // Get due dates from html
  const dueDates = await page.evaluate(() => {
    return Array.from( document.getElementsByClassName('accDue')).map(a => a.innerText) 
  });
  dueDates.shift() // drop the header

  // Output loans due soon
  let dueSoon = []
  let due = []

  dueDates.forEach(d => {
    d = d.replace('\t', '')

    const loanDue = moment(d, "DD MMMM")
    const now = moment()

    const diff = moment.duration(loanDue - now)
    const daysTillDue = diff.days()
    // console.log(`${diff.days()} days, ${diff.hours()} hours`)

    if (daysTillDue < DAYS_SOON) {
      dueSoon.push(daysTillDue)
    }
    due.push(daysTillDue)
  })

  dueSoon.sort(sortNumbers)
  due.sort(sortNumbers)

  console.log(`Loans oustanding:   ${dueDates.length} loans`);
  console.log(`Due in next ${DAYS_SOON} days: ${dueSoon.length} loans`)
  console.log(`Soonest due:        ${due[0] || 'n/a'} days\n`)


  // Get renew counts from html
  const renewCounts = await page.evaluate(() => {
    return Array.from( document.getElementsByClassName('accRenews')).map(a => a.innerText) 
  });
  renewCounts.shift() // drop the header

  const renewCountsArray = []

  renewCounts.forEach(d => {
    d = d.replace('\t', '')
    renewCountsArray.push(Number(d))
  })

  renewCountsArray.sort(sortNumbers)
  const highestRenewals = renewCountsArray.slice(-1)[0] 

  console.log(`Highest renew count: ${highestRenewals || n/a} times\n`)

  // if one has reached max renewals, log it
  // loans.each((l) => l.)

  // prompt to renew y/n
  // renew all that can be renewed
  // await page.click()
  
  
  // check if reserved by someone else

  await page.screenshot({path: 'screenshots/loans.png'});

  await browser.close();
})();

function sortNumbers(a, b) {
  return a - b
}
