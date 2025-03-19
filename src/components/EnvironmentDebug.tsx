import React, { useState } from 'react';
import { testApifyToken } from '../lib/apifyRightmoveScraper';
import { testGeminiAPI } from '../lib/geminiService';

interface EnvVarDisplayProps {
  name: string;
  value: string | boolean | undefined;
}

const EnvVarDisplay: React.FC<EnvVarDisplayProps> = ({ name, value }) => {
  // Convert value to string and colorize based on boolean values
  const stringValue = String(value);
  const isBoolean = value === true || value === false || value === 'true' || value === 'false';
  
  // Mask API keys for security
  const isSensitive = name.toLowerCase().includes('api_key') || name.toLowerCase().includes('apikey') || 
                      name.toLowerCase().includes('api_token') || name.toLowerCase().includes('token');
  const displayValue = isSensitive && stringValue && stringValue.length > 8 
    ? `${stringValue.substring(0, 4)}...${stringValue.substring(stringValue.length - 4)}`
    : stringValue;
  
  return (
    <div className="mb-1 flex items-start">
      <div className="font-mono font-medium w-60">{name}:</div>
      <div className={`font-mono ${isBoolean ? (
        stringValue === 'true' ? 'text-green-600 font-bold' : 
        stringValue === 'false' ? 'text-red-600' : ''
      ) : ''}`}>
        {displayValue || '(undefined)'}
      </div>
    </div>
  );
};

const EnvironmentDebug = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [apiKeyTestResult, setApiKeyTestResult] = useState<string | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiStatus, setApiStatus] = useState<{status?: number, message: string} | null>(null);
  const [apifyTestResult, setApifyTestResult] = useState<string | null>(null);
  const [isTestingApify, setIsTestingApify] = useState(false);
  const [apifyRightmoveTestResult, setApifyRightmoveTestResult] = useState<string | null>(null);
  const [isTestingApifyRightmove, setIsTestingApifyRightmove] = useState(false);
  const [testLocation, setTestLocation] = useState<string>('OUTCODE%5E2445');
  const [showCorsHelp, setShowCorsHelp] = useState(false);
  const [apifyStatus, setApifyStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [geminiStatus, setGeminiStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  
  // Get all environment variables from import.meta.env
  const allEnvVars = { ...import.meta.env };
  
  // Special processing for VITE_USE_MOCK_DATA to check string vs boolean
  const mockDataEnv = import.meta.env.VITE_USE_MOCK_DATA;
  const mockDataString = typeof mockDataEnv === 'string' ? mockDataEnv : String(mockDataEnv);
  const mockDataBoolean = typeof mockDataEnv === 'string' 
    ? mockDataEnv.toLowerCase() === 'true'
    : Boolean(mockDataEnv);
  
  // Get API key info
  const scraperApiKey = import.meta.env.VITE_SCRAPER_API_KEY || '162910ce5fe80080edef0fe026506f0e';
  const isDefaultScraperKey = scraperApiKey === '162910ce5fe80080edef0fe026506f0e';
  
  // Get Apify token info
  const apifyToken = import.meta.env.VITE_APIFY_API_TOKEN || 'apify_api_aPVtpmUSZzjriimnhQ6qsQuVXxqSpB12oY5r';
  const isDefaultApifyToken = apifyToken === 'apify_api_aPVtpmUSZzjriimnhQ6qsQuVXxqSpB12oY5r';
  
  // Function to test the ScraperAPI key
  const testApiKey = async () => {
    setIsTestingApi(true);
    setApiKeyTestResult(null);
    setApiStatus(null);
    
    try {
      // First test with a simple website
      console.log('Testing ScraperAPI key with a simple website...');
      const testUrl = 'https://api.scraperapi.com/scrape?api_key=' + scraperApiKey + '&url=' + encodeURIComponent('https://www.example.com');
      
      const response = await fetch(testUrl);
      const isBasicValid = response.ok;
      const statusCode = response.status;
      
      let statusMessage = 'Unknown error';
      
      // Specific error handling for common status codes
      if (statusCode === 401) {
        statusMessage = 'Unauthorized: Your ScraperAPI key is invalid or expired';
      } else if (statusCode === 403) {
        statusMessage = 'Forbidden: Your ScraperAPI account may be suspended';
      } else if (statusCode === 404) {
        statusMessage = 'Not Found: Your ScraperAPI key is invalid or the API endpoint has changed';
      } else if (statusCode === 429) {
        statusMessage = 'Too Many Requests: You have exceeded your ScraperAPI plan limits';
      } else if (isBasicValid) {
        statusMessage = 'Success';
      } else {
        statusMessage = `Error: ${response.status} ${response.statusText}`;
      }
      
      setApiStatus({
        status: statusCode,
        message: statusMessage
      });
      
      // Then test with a Rightmove property URL (the one the user specifically tested)
      console.log('Testing ScraperAPI key with a Rightmove property...');
      const rightmoveTestUrl = 'https://api.scraperapi.com/scrape?api_key=' + scraperApiKey + 
        '&url=' + encodeURIComponent('https://www.rightmove.co.uk/properties/150455012') + 
        '&render=true&country_code=uk&premium=true';
      
      let rightmoveResponse;
      let rightmoveStatus = 'Not tested';
      
      try {
        rightmoveResponse = await fetch(rightmoveTestUrl);
        rightmoveStatus = rightmoveResponse.ok 
          ? '✅ Success'
          : `❌ Failed (${rightmoveResponse.status})`;
      } catch (e) {
        rightmoveStatus = '❌ Connection error';
      }
      
      if (isBasicValid && rightmoveResponse?.ok) {
        setApiKeyTestResult('✅ Fully Valid - Works with both test sites and Rightmove');
      } else if (isBasicValid) {
        setApiKeyTestResult('⚠️ Partially Valid - Works with test sites but NOT with Rightmove (Status: ' + 
          (rightmoveResponse?.status || 'unknown') + ')');
      } else {
        setApiKeyTestResult('❌ Invalid API Key (Status: ' + response.status + ' - ' + response.statusText + ')');
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      setApiKeyTestResult('❌ Error: ' + (error instanceof Error ? error.message : String(error)));
      setApiStatus({
        message: 'Connection error: Could not reach ScraperAPI servers'
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  // Function to test the Apify API token
  const testApifyAPIToken = async () => {
    setIsTestingApify(true);
    setApifyTestResult(null);
    
    try {
      const result = await testApifyToken();
      setApifyTestResult(result.success 
        ? `✅ ${result.message}`
        : `❌ ${result.message}`);
    } catch (error) {
      console.error('Error testing Apify token:', error);
      setApifyTestResult('❌ Error: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsTestingApify(false);
    }
  };
  
  // Function to test the Apify Rightmove scraper with a specific outcode
  const testApifyRightmoveScraper = async () => {
    setIsTestingApifyRightmove(true);
    setApifyRightmoveTestResult(null);
    
    try {
      console.log(`Testing Apify Rightmove scraper with location: ${testLocation}`);
      
      // In development mode, use an alternative approach to avoid CORS
      if (import.meta.env.DEV) {
        console.log('Testing in development mode - using sample dataset');
        
        // Try to access the sample dataset directly
        const response = await fetch('https://api.apify.com/v2/datasets/RPnlhVhYUc2eHliSs/items?token=apify_api_aPVtpmUSZzjriimnhQ6qsQuVXxqSpB12oY5r&limit=1');
        
        if (!response.ok) {
          throw new Error(`Failed to access Apify sample dataset: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Successfully accessed Apify dataset:', data);
        
        setApifyRightmoveTestResult(`✅ Successfully connected to Apify. In development mode, direct API calls are limited due to CORS restrictions.`);
        return;
      }
      
      // In production, make the actual API call
      // Construct the test URL
      const searchUrl = `https://www.rightmove.co.uk/property-for-sale/find.html?locationIdentifier=${testLocation}`;
      
      // Prepare input for the Apify actor
      const testInput = {
        listUrls: [{ url: searchUrl, method: "GET" }],
        fullScrape: true,
        monitoringMode: false,
        fullPropertyDetails: true, 
        maxProperties: 1, // Just request 1 property for the test
        proxy: { useApifyProxy: true }
      };
      
      // Make direct fetch request to the Apify API
      const response = await fetch(`https://api.apify.com/v2/acts/dhrumil/rightmove-scraper/runs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apifyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ run: { input: testInput } })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Test failed:', {
          status: response.status,
          statusText: response.statusText,
          response: errorText
        });
        setApifyRightmoveTestResult(`❌ Failed to start Apify actor: ${response.status} ${response.statusText}`);
        return;
      }
      
      const data = await response.json();
      console.log('Apify actor started:', data);
      
      // Show immediate success - we won't wait for completion
      setApifyRightmoveTestResult(`✅ Successfully started Apify Rightmove scraper with run ID: ${data.data.id}`);
      
    } catch (error) {
      console.error('Error testing Apify Rightmove scraper:', error);
      setApifyRightmoveTestResult('❌ Error: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsTestingApifyRightmove(false);
    }
  };

  // Function to test the Gemini API
  const testGemini = async () => {
    setIsTestingGemini(true);
    try {
      const result = await testGeminiAPI();
      setGeminiStatus(result);
    } catch (error) {
      console.error('Error testing Gemini API:', error);
      setGeminiStatus({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsTestingGemini(false);
    }
  };
    
  return (
    <div className="border rounded-md p-3 bg-gray-50 my-4">
      <div 
        className="flex justify-between items-center cursor-pointer font-medium" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg">Environment Variables Debug</h3>
        <span>{isExpanded ? '▼' : '►'}</span>
      </div>
      
      {isExpanded && (
        <div className="mt-3 text-sm">
          <h4 className="font-semibold mb-2">Mock Data Settings</h4>
          <EnvVarDisplay name="VITE_USE_MOCK_DATA (raw)" value={mockDataString} />
          <EnvVarDisplay name="VITE_USE_MOCK_DATA (interpreted)" value={mockDataBoolean} />
          
          <h4 className="font-semibold mb-2 mt-4">Apify Settings</h4>
          <EnvVarDisplay name="VITE_APIFY_API_TOKEN" value={apifyToken} />
          <div className="mb-1 flex items-start">
            <div className="font-mono font-medium w-60">Token Status:</div>
            <div className={`font-mono ${isDefaultApifyToken ? 'text-yellow-600' : 'text-green-600'}`}>
              {isDefaultApifyToken ? 'Using provided token' : 'Using custom token'}
            </div>
          </div>
          
          {apifyTestResult && (
            <div className="mb-1 flex items-start">
              <div className="font-mono font-medium w-60">Apify Test Result:</div>
              <div className="font-mono">{apifyTestResult}</div>
            </div>
          )}
          
          <div className="mt-2 mb-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                testApifyAPIToken();
              }}
              disabled={isTestingApify}
              className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isTestingApify ? 'Testing...' : 'Test Apify Token'}
            </button>
          </div>
          
          <h4 className="font-semibold mb-2 mt-4">Apify Rightmove Scraper Test</h4>
          <div className="mb-2 flex items-start">
            <div className="font-mono font-medium w-60">Test Location:</div>
            <input 
              type="text" 
              value={testLocation}
              onChange={(e) => setTestLocation(e.target.value)}
              className="border rounded px-2 py-1 text-sm font-mono w-64"
              placeholder="OUTCODE%5E2445"
            />
          </div>
          
          {apifyRightmoveTestResult && (
            <div className="mb-1 flex items-start">
              <div className="font-mono font-medium w-60">Rightmove Test:</div>
              <div className="font-mono max-w-lg break-words">{apifyRightmoveTestResult}</div>
            </div>
          )}
          
          <div className="mt-2 mb-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                testApifyRightmoveScraper();
              }}
              disabled={isTestingApifyRightmove}
              className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isTestingApifyRightmove ? 'Testing...' : 'Test Rightmove Scraper'}
            </button>
            <div className="mt-2 text-xs text-gray-600">
              Try with <code>OUTCODE%5E2445</code> (replace with your desired location)
            </div>
          </div>
          
          <h4 className="font-semibold mb-2 mt-4">ScraperAPI Settings (Legacy)</h4>
          <EnvVarDisplay name="VITE_SCRAPER_API_KEY" value={scraperApiKey} />
          <div className="mb-1 flex items-start">
            <div className="font-mono font-medium w-60">Key Status:</div>
            <div className={`font-mono ${isDefaultScraperKey ? 'text-red-500 font-bold' : 'text-green-600'}`}>
              {isDefaultScraperKey ? 'Using default key (NOT WORKING)' : 'Using custom key'}
            </div>
          </div>
          
          {apiStatus && (
            <div className="mb-1 flex items-start">
              <div className="font-mono font-medium w-60">API Response:</div>
              <div className={`font-mono ${apiStatus.status && apiStatus.status >= 200 && apiStatus.status < 300 ? 'text-green-600' : 'text-red-500'}`}>
                {apiStatus.status ? `${apiStatus.status} - ${apiStatus.message}` : apiStatus.message}
              </div>
            </div>
          )}
          
          {apiKeyTestResult && (
            <div className="mb-1 flex items-start">
              <div className="font-mono font-medium w-60">API Test Result:</div>
              <div className="font-mono">{apiKeyTestResult}</div>
            </div>
          )}
          
          <h4 className="font-semibold mb-2 mt-4">Gemini API Settings</h4>
          <EnvVarDisplay name="VITE_GEMINI_API_KEY" value={import.meta.env.VITE_GEMINI_API_KEY} />
          <div className="mb-1 flex items-start">
            <div className="font-mono font-medium w-60">Gemini API Status:</div>
            <div className={`font-mono ${import.meta.env.VITE_GEMINI_API_KEY ? 'text-green-600' : 'text-red-600'}`}>
              {import.meta.env.VITE_GEMINI_API_KEY ? 'Using custom key' : 'Using default key'}
            </div>
          </div>
          
          <h4 className="font-semibold mb-2 mt-4">Other Environment Variables</h4>
          <EnvVarDisplay name="NODE_ENV" value={import.meta.env.NODE_ENV} />
          <EnvVarDisplay name="MODE" value={import.meta.env.MODE} />
          <EnvVarDisplay name="DEV" value={import.meta.env.DEV} />
          <EnvVarDisplay name="PROD" value={import.meta.env.PROD} />
          
          <h4 className="font-semibold mb-2 mt-4">All Environment Variables</h4>
          {Object.entries(allEnvVars)
            .filter(([key]) => key !== 'SSR') // Filter out the SSR proxy object
            .map(([key, value]) => (
              <EnvVarDisplay key={key} name={key} value={value as string} />
            ))}
          
          {import.meta.env.DEV && (
            <div className="mt-4 border-t pt-3">
              <h4 className="font-semibold mb-2 flex items-center cursor-pointer" onClick={() => setShowCorsHelp(!showCorsHelp)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Development Mode & CORS Issues
                <span className="ml-2">{showCorsHelp ? "▼" : "►"}</span>
              </h4>
              
              {showCorsHelp && (
                <div className="bg-orange-50 p-3 rounded-md border border-orange-200">
                  <p className="font-medium mb-2">You're encountering CORS issues with Apify API</p>
                  <p className="mb-2 text-xs">
                    The browser blocks direct API calls to Apify due to Cross-Origin Resource Sharing (CORS) restrictions.
                    This is a security feature of web browsers.
                  </p>
                  
                  <h5 className="font-medium mb-1 mt-3">Possible Solutions:</h5>
                  <ol className="list-decimal ml-5 text-xs space-y-1">
                    <li>
                      <strong>Use the sample data mode</strong> - The app is configured to use sample 
                      data in development mode to work around CORS
                    </li>
                    <li>
                      <strong>Use a CORS proxy</strong> - You can set up a local proxy server that makes the API calls for you
                    </li>
                    <li>
                      <strong>Install a CORS browser extension</strong> - Extensions like "CORS Unblock" can disable CORS 
                      checks temporarily (not recommended for regular browsing)
                    </li>
                    <li>
                      <strong>Create a server-side API</strong> - For production, implement a server endpoint that makes the 
                      Apify calls
                    </li>
                  </ol>
                  
                  <h5 className="font-medium mb-1 mt-3">Quick CORS Extension Setup:</h5>
                  <ol className="list-decimal ml-5 text-xs space-y-1">
                    <li>Install a CORS extension like "CORS Unblock" for Chrome/Firefox</li>
                    <li>Enable the extension when working with this application</li>
                    <li>Disable the extension when browsing other websites for security</li>
                  </ol>
                  
                  <p className="mt-3 text-xs bg-blue-50 p-2 rounded">
                    In sample data mode, the app will use data from a previous successful Apify run. The data is limited,
                    but it allows you to test the UI without CORS issues.
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4 p-2 bg-blue-50 text-blue-800 text-xs rounded">
            <p className="font-semibold">Troubleshooting Tips:</p>
            <ul className="list-disc ml-4 mt-1">
              <li>If VITE_USE_MOCK_DATA is 'true', the app will use mock data</li>
              <li>VITE_USE_MOCK_DATA must be set to 'false' (string) to disable mock data</li>
              <li className="font-bold">A valid Apify API token is required for property searches</li>
              <li>Add your Apify token to .env.local as VITE_APIFY_API_TOKEN=your_token_here</li>
              <li>Restart your dev server after changing environment variables</li>
              <li className="font-bold mt-1">For Rightmove searches:</li>
              <li>For outcodes (e.g., SW1) use format: <code>OUTCODE%5E1234</code></li>
              <li>For regions/areas use format: <code>REGION%5ELondon</code></li>
            </ul>
          </div>
          
          <div className="mt-4 p-2 bg-yellow-50 text-yellow-800 text-xs rounded">
            <p className="font-semibold">CORS Limitations in Development:</p>
            <ul className="list-disc ml-4 mt-1">
              <li>When running in development mode, direct API calls to Apify have CORS restrictions</li>
              <li>The application uses sample data in development to work around these limitations</li>
              <li>In production deployment, CORS issues won't occur as requests will be server-side</li>
              <li>If you need to test with live data during development, consider using a CORS proxy or browser extension</li>
            </ul>
          </div>

          <div className="mt-4 p-2 bg-green-50 text-green-800 text-xs rounded">
            <p className="font-semibold">Gemini API Status:</p>
            <div>{geminiStatus?.message}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentDebug; 