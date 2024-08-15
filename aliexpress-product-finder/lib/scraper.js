import puppeteer from 'puppeteer';
import { Redis } from '@upstash/redis';
import axios from 'axios';

const defaultImageUrl = "/default-image.avif"

const UPSTASH_REDIS_URL = process.env.UPSTASH_REDIS_URL
const UPSTASH_REDIS_TOKEN = process.env.UPSTASH_REDIS_TOKEN
if (!UPSTASH_REDIS_URL || !UPSTASH_REDIS_TOKEN) {
  throw new Error('Please set UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN in your environment variables');
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

const CURRENCY_CONVERSION_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD'; // Replace with your currency conversion API URL

// Function to convert currency to USD
async function convertToUSD(price, fromCurrency) {
  try {
    const response = await axios.get(CURRENCY_CONVERSION_API_URL);
    const rates = response.data.rates;
    const conversionRate = rates[fromCurrency];
    if (conversionRate) {
      return (price / conversionRate).toFixed(2); // Convert and round to 2 decimal places
    }
  } catch (error) {
    console.error('Currency conversion error:', error);
  }
  return price; // Return original price if conversion fails
}

export async function scrapeAliExpress(searchTerm) {
  const cacheKey = `aliexpress:${searchTerm}`;
  
  // Fetch cached results
  const cachedResults = await redis.get(cacheKey);
  
  // If cache exists, parse it as JSON and return
  if (cachedResults) {
    try {
      // Check if cachedResults is already an object
      if (typeof cachedResults === 'string') {
        return JSON.parse(cachedResults);
      }
      return cachedResults; // If it's an object, return it directly
    } catch (error) {
      console.error('Error parsing cached results:', error);
      // If parsing fails, proceed to scrape the data again
    }
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(searchTerm)}`);

  const products = await page.evaluate(async (defaultImageUrl) => {
    const currency = 'USD'; // Assume prices are initially in USD or set this based on local currency
    const exchangeRates = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(response => response.json())
      .then(data => data.rates);
    
    function parsePrice(priceText) {
      // Extract the numeric part of the price
      const priceMatch = priceText.match(/[\d.,]+/);
      if (priceMatch) {
        return parseFloat(priceMatch[0].replace(',', ''));
      }
      return null;
    }

    async function convertToUSD(price, fromCurrency) {
      const conversionRate = exchangeRates[fromCurrency];
      if (conversionRate) {
        return (price / conversionRate).toFixed(2); // Convert and round to 2 decimal places
      }
      return price; // Return original price if conversion fails
    }

    return Promise.all(Array.from(document.querySelectorAll('.search-item-card-wrapper-gallery')).map(async el => {
      const priceText = el.querySelector('.multi--price-sale--U-S0jtj')?.innerText || 'No price available';
      const localCurrency = 'CNY'; // Replace this with the detected local currency if available
      const price = parsePrice(priceText);
      const priceInUSD = price ? await convertToUSD(price, localCurrency) : 'No price available';

      return {
        name: el.querySelector('.multi--titleText--nXeOvyr')?.innerText || 'No name available',
        price: priceInUSD,
        image: el.querySelector('.images--item--3XZa6xf')?.src || defaultImageUrl,
        url: el.querySelector('a')?.href || 'No URL available',
      };
    }));
  }, defaultImageUrl);

  await browser.close();

  // Cache the results for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(products));
  
  return products;
}
