import express, { Request, Response } from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: ['https://myvge.com', 'http://localhost:5173'], // Add your local development URL
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Origin']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

app.post('/api/scrape-properties', async (req: Request, res: Response) => {
  const { location, page = 1 } = req.body;

  if (!location) {
    return res.status(400).json({ message: 'Location is required' });
  }

  try {
    console.log(`Starting property search for location: ${location}, page: ${page}`);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    const browserPage = await browser.newPage();
    
    // Set a reasonable timeout
    browserPage.setDefaultNavigationTimeout(30000);
    
    // Format location for URL
    const formattedLocation = encodeURIComponent(location);
    const searchUrl = `https://www.rightmove.co.uk/property-for-sale/find.html?searchType=SALE&locationIdentifier=${formattedLocation}&insId=1&radius=0.0&minPrice=&maxPrice=&minBedrooms=&maxBedrooms=&displayPropertyType=&maxDaysSinceAdded=&_includeSSTC=on&sortByPriceDescending=&primaryDisplayPropertyType=&secondaryDisplayPropertyType=&oldDisplayPropertyType=&oldPrimaryDisplayPropertyType=&newHome=&auction=false&index=${(page - 1) * 24}`;
    
    console.log(`Navigating to: ${searchUrl}`);
    
    await browserPage.goto(searchUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for property cards to load
    await browserPage.waitForSelector('.propertyCard', { timeout: 5000 })
      .catch(() => console.log('No property cards found'));

    // Scrape property data
    const properties = await browserPage.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.propertyCard'));
      
      return items.map(item => {
        // Get price
        const priceText = item.querySelector('.propertyCard-priceValue')?.textContent || '';
        const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;

        // Get bedrooms
        const bedroomsText = item.querySelector('.property-information span')?.textContent || '';
        const bedrooms = parseInt(bedroomsText) || 0;

        // Get image
        const imageElement = item.querySelector('.propertyCard-img img');
        const image_url = imageElement?.getAttribute('src') || '';

        // Get property link
        const linkElement = item.querySelector('.propertyCard-link');
        const source_url = linkElement ? 
          'https://www.rightmove.co.uk' + linkElement.getAttribute('href') : '';

        // Get property type
        const propertyType = item.querySelector('.property-information')
          ?.textContent?.split('•')[1]?.trim() || '';

        return {
          id: item.getAttribute('id') || Math.random().toString(36).substr(2, 9),
          title: item.querySelector('.propertyCard-title')?.textContent?.trim() || '',
          price,
          description: item.querySelector('.propertyCard-description')?.textContent?.trim() || '',
          location: item.querySelector('.propertyCard-address')?.textContent?.trim() || '',
          bedrooms,
          bathrooms: 0, // Rightmove doesn't always show this
          sqft: 0, // Rightmove doesn't always show this
          image_url,
          property_type: propertyType,
          source_url,
          is_featured: false
        };
      });
    });

    // Get total results count
    const totalResults = await browserPage.evaluate(() => {
      const resultCount = document.querySelector('.searchHeader-resultCount');
      return parseInt(resultCount?.textContent?.replace(/[^0-9]/g, '') || '0');
    });

    await browser.close();

    console.log(`Found ${properties.length} properties out of ${totalResults} total results`);

    return res.status(200).json({
      properties,
      totalResults,
      currentPage: page,
      totalPages: Math.ceil(totalResults / 24)
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return res.status(500).json({ 
      message: 'Failed to scrape properties',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 