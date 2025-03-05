import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { location, page = 1 } = req.body;

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const browserPage = await browser.newPage();
    
    // Format location for URL
    const formattedLocation = encodeURIComponent(location);
    
    // Go to Rightmove search page
    await browserPage.goto(
      `https://www.rightmove.co.uk/properties/${formattedLocation}.html?searchType=SALE&page=${page}`,
      { waitUntil: 'networkidle0' }
    );

    // Scrape property data
    const properties = await browserPage.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[data-test="propertyCard"]'));
      
      return items.map(item => {
        // Get price
        const priceElement = item.querySelector('[data-test="property-price"]');
        const priceText = priceElement?.textContent || '';
        const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;

        // Get bedrooms
        const bedroomsElement = item.querySelector('[data-test="property-bedrooms"]');
        const bedrooms = parseInt(bedroomsElement?.textContent || '0');

        // Get bathrooms
        const bathroomsElement = item.querySelector('[data-test="property-bathrooms"]');
        const bathrooms = parseInt(bathroomsElement?.textContent || '0');

        // Get image
        const imageElement = item.querySelector('img[alt*="Property"]') as HTMLImageElement;
        const image_url = imageElement?.src || '';

        // Get property link
        const linkElement = item.querySelector('a[data-test="property-details"]') as HTMLAnchorElement;
        const source_url = linkElement ? `https://www.rightmove.co.uk${linkElement.getAttribute('href')}` : '';

        return {
          id: item.getAttribute('id') || Math.random().toString(36).substr(2, 9),
          title: item.querySelector('[data-test="property-title"]')?.textContent?.trim() || '',
          price,
          description: item.querySelector('[data-test="property-description"]')?.textContent?.trim() || '',
          location: item.querySelector('[data-test="property-address"]')?.textContent?.trim() || '',
          bedrooms,
          bathrooms,
          sqft: 0, // Rightmove doesn't always show this, we'll need to fetch it from the property page
          image_url,
          property_type: item.querySelector('[data-test="property-type"]')?.textContent?.trim() || '',
          source_url,
          is_featured: false
        };
      });
    });

    // Get total results count
    const totalResults = await browserPage.evaluate(() => {
      const resultCount = document.querySelector('[data-test="results-count"]');
      return parseInt(resultCount?.textContent?.replace(/[^0-9]/g, '') || '0');
    });

    await browser.close();

    return res.status(200).json({
      properties,
      totalResults,
      currentPage: page,
      totalPages: Math.ceil(totalResults / 24) // Rightmove shows 24 properties per page
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return res.status(500).json({ 
      message: 'Failed to scrape properties',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 