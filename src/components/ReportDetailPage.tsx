import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from './Layout';
import { PageTransition } from './ui/page-transition';
import { Button } from './ui/button';
import { 
  Calendar, 
  User, 
  Tag, 
  ArrowLeft, 
  Share2, 
  Bookmark,
  Download,
  FileText, 
  PenSquare
} from 'lucide-react';
import { formatDate } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { SubscriptionModal } from './SubscriptionModal';

// Mock report data - this would be fetched from an API in a real application
const reportData = [
  {
    id: 1,
    title: "UK Property Market Outlook 2024",
    slug: "uk-property-market-outlook-2024",
    summary: "Comprehensive analysis of the UK property market trends, investment opportunities, and forecasts for 2024.",
    content: `
      <h2>Executive Summary</h2>
      <p>The UK property market in 2024 continues to demonstrate resilience despite economic challenges. This report provides a comprehensive analysis of current trends, regional variations, and forecasts for the remainder of the year.</p>
      
      <h2>Market Overview</h2>
      <p>UK house prices have shown moderate growth of 2.3% year-on-year, with significant regional variations. The market has stabilized following the volatility of previous years, with transaction volumes returning to pre-pandemic levels.</p>
      
      <h3>Key Findings</h3>
      <ul>
        <li>Average UK house price stands at £289,950 as of May 2024</li>
        <li>Northern regions continue to outperform London and the South East</li>
        <li>First-time buyer activity has increased by 7% compared to 2023</li>
        <li>Rental yields remain robust at national average of 5.5%</li>
      </ul>
      
      <h2>Regional Analysis</h2>
      <p>The North West remains the strongest performing region with annual price growth of 4.8%. Liverpool and Manchester continue to lead with strong rental yields exceeding 7% in some areas. London has shown minimal growth at 0.2%, though prime central areas have begun to recover.</p>
      
      <h2>Investment Opportunities</h2>
      <p>Based on our analysis, we identify several key opportunity areas for property investors:</p>
      <ol>
        <li>Northern city regeneration zones, particularly in Leeds and Sheffield</li>
        <li>Commuter belt towns with improved transport links</li>
        <li>University cities with strong student rental demand</li>
        <li>Coastal locations with growing demand from remote workers</li>
      </ol>
      
      <h2>Forecast and Recommendations</h2>
      <p>We project continued moderate growth of 3-4% nationally for the remainder of 2024, with the potential for stronger performance in regional hotspots. Interest rates are expected to stabilize, potentially decreasing in Q4, which may stimulate additional market activity.</p>
      
      <p>For investors, we recommend focusing on areas with strong fundamentals: employment growth, infrastructure improvements, and demographic advantages. Diversification across regions and property types remains advisable in the current market.</p>
    `,
    date: "2024-05-15",
    author: "Property Analysis Team",
    authorBio: "Our Property Analysis Team consists of economists, data scientists, and real estate professionals with decades of combined experience in the UK property market.",
    category: "Market Analysis",
    readTime: "12 min read",
    isPremium: true,
    relatedReports: [2, 3],
    coverImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8aG91c2V8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80"
  },
  {
    id: 2,
    title: "Regional Investment Hotspots",
    slug: "regional-investment-hotspots",
    summary: "Detailed report on emerging regional investment opportunities across the UK, with focus on yields and growth potential.",
    content: `
      <h2>Executive Summary</h2>
      <p>This report identifies and analyzes emerging investment hotspots across UK regions, focusing on areas with strong yield potential and capital growth prospects.</p>
      
      <h2>Methodology</h2>
      <p>Our analysis combines economic data, infrastructure developments, demographic trends, and rental yield calculations to identify areas with the strongest investment potential.</p>
      
      <h2>Top Investment Locations</h2>
      <h3>1. Liverpool - Merseyside</h3>
      <p>Liverpool continues to offer some of the highest rental yields in the UK, averaging 7.2%. Regeneration projects and growing employment opportunities make this a prime investment location.</p>
      
      <h3>2. Manchester - Greater Manchester</h3>
      <p>With significant job creation in technology and media sectors, Manchester maintains strong rental demand and price growth potential. Average yields stand at 6.7%.</p>
      
      <h3>3. Leeds - West Yorkshire</h3>
      <p>Substantial infrastructure investment and a growing financial sector support Leeds' position as a key northern investment hub, with yields averaging 6.1%.</p>
      
      <h3>4. Birmingham - West Midlands</h3>
      <p>The ongoing HS2 development and city center regeneration continue to boost Birmingham's investment appeal, with rental yields of 5.5%.</p>
      
      <h3>5. Glasgow - Scotland</h3>
      <p>Offering a compelling combination of affordable property prices and strong rental demand, Glasgow presents excellent value for investors with yields around 5.8%.</p>
      
      <h2>Emerging Areas to Watch</h2>
      <p>Besides established hotspots, we've identified several emerging areas showing strong investment potential:</p>
      <ul>
        <li>Sheffield - South Yorkshire</li>
        <li>Nottingham - East Midlands</li>
        <li>Preston - Lancashire</li>
        <li>Swansea - Wales</li>
      </ul>
      
      <h2>Conclusion and Outlook</h2>
      <p>Regional cities continue to offer superior yield potential compared to London and the South East. The leveling up agenda and infrastructure improvements are likely to sustain this trend, making northern and midland cities particularly attractive for investors focused on rental returns.</p>
    `,
    date: "2024-04-22",
    author: "Investment Research Division",
    authorBio: "The Investment Research Division specializes in analyzing property investment trends and identifying high-potential opportunities across the UK and international markets.",
    category: "Investment",
    readTime: "15 min read",
    isPremium: true,
    relatedReports: [1, 3],
    coverImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cHJvcGVydHl8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80"
  },
  {
    id: 3,
    title: "First-Time Buyer Guide 2024",
    slug: "first-time-buyer-guide-2024",
    summary: "Essential information and advice for first-time buyers navigating the property market in 2024.",
    content: `
      <h2>Introduction</h2>
      <p>Buying your first home is both exciting and challenging. This guide provides first-time buyers with essential information and practical advice for navigating the property market in 2024.</p>
      
      <h2>Current Market Conditions for First-Time Buyers</h2>
      <p>The 2024 market presents a mixed picture for first-time buyers. While price growth has moderated to 2.3% nationally, affordability remains challenging in many areas. However, various government schemes and competitive mortgage products designed specifically for first-time buyers offer valuable support.</p>
      
      <h2>Financial Preparation</h2>
      <h3>Saving for a Deposit</h3>
      <p>The average first-time buyer deposit currently stands at £53,000, though this varies significantly by region. We recommend:</p>
      <ul>
        <li>Setting up a dedicated savings account</li>
        <li>Considering a Lifetime ISA to benefit from government bonuses</li>
        <li>Exploring family support options including gifted deposits</li>
      </ul>
      
      <h3>Mortgage Options</h3>
      <p>Several mortgage products cater specifically to first-time buyers:</p>
      <ul>
        <li>95% LTV mortgages with government guarantees</li>
        <li>Longer-term mortgages (up to 35 years) to improve affordability</li>
        <li>Joint borrower sole proprietor mortgages for family assistance</li>
        <li>Green mortgages offering preferential rates for energy-efficient properties</li>
      </ul>
      
      <h2>Government Schemes</h2>
      <p>Several programs exist to help first-time buyers:</p>
      <ul>
        <li>First Homes scheme - discounted properties for local first-time buyers</li>
        <li>Shared Ownership - buy a portion of a property and pay rent on the remainder</li>
        <li>Help to Build - support for self-builders and custom home projects</li>
      </ul>
      
      <h2>The Buying Process</h2>
      <ol>
        <li>Establish your budget and secure a mortgage in principle</li>
        <li>Research areas and property types within your price range</li>
        <li>View properties and make an offer</li>
        <li>Instruct a solicitor and arrange surveys</li>
        <li>Exchange contracts and complete the purchase</li>
      </ol>
      
      <h2>Common Pitfalls to Avoid</h2>
      <p>First-time buyers should be aware of these common mistakes:</p>
      <ul>
        <li>Overlooking additional costs such as stamp duty, legal fees, and moving expenses</li>
        <li>Neglecting to research the local area thoroughly</li>
        <li>Skipping professional surveys to save money</li>
        <li>Stretching finances too thin without maintaining a financial cushion</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>While the process of buying your first home can seem daunting, careful preparation and the right support can make it manageable. Current market conditions offer a balanced environment for first-time buyers, with various support mechanisms available to help you take that important first step onto the property ladder.</p>
    `,
    date: "2024-03-10",
    author: "Homebuyer Advisory Team",
    authorBio: "Our Homebuyer Advisory Team specializes in providing practical guidance to first-time buyers and those navigating the property market.",
    category: "Guides",
    readTime: "10 min read",
    isPremium: false,
    relatedReports: [1, 2],
    coverImage: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8aG9tZSUyMGtleXN8ZW58MHx8MHx8&w=1000&q=80"
  }
];

const ReportDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [relatedReports, setRelatedReports] = useState<any[]>([]);
  
  const isSubscriber = profile?.subscription_tier !== "free";

  useEffect(() => {
    // Simulate API call to fetch the report
    const fetchReport = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          const foundReport = reportData.find(r => r.slug === slug);
          setReport(foundReport || null);
          
          // Get related reports
          if (foundReport?.relatedReports) {
            const related = reportData.filter(r => 
              foundReport.relatedReports.includes(r.id) && r.id !== foundReport.id
            );
            setRelatedReports(related);
          }
          
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error fetching report:", error);
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchReport();
    }
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <PageTransition>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/4 mb-8"></div>
                <div className="h-64 bg-muted rounded mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </PageTransition>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout>
        <PageTransition>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The report you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/research')}>
                Return to Research
              </Button>
            </div>
          </div>
        </PageTransition>
      </Layout>
    );
  }

  // Check if premium content is accessible
  const canAccessContent = !report.isPremium || isSubscriber;

  return (
    <Layout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-6" 
              onClick={() => navigate('/research')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Research
            </Button>

            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">{report.title}</h1>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(new Date(report.date))}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-1" />
                  {report.author}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Tag className="h-4 w-4 mr-1" />
                  {report.category}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 mr-1" />
                  {report.readTime}
                </div>
              </div>
              
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-8">
                <img 
                  src={report.coverImage} 
                  alt={report.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="text-lg mb-6">
                <p className="font-medium">{report.summary}</p>
              </div>
              
              {canAccessContent ? (
                <>
                  <div 
                    className="prose max-w-none" 
                    dangerouslySetInnerHTML={{ __html: report.content }}
                  />
                  
                  <div className="flex justify-between items-center mt-12 pt-6 border-t">
                    <Button variant="outline" onClick={() => window.print()}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-muted p-8 rounded-lg text-center my-12">
                  <PenSquare className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Premium Content</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    This research report is available exclusively to Pro and Premium subscribers.
                  </p>
                  <Button onClick={() => setIsSubscriptionModalOpen(true)}>
                    Upgrade to Access
                  </Button>
                </div>
              )}
            </div>

            {/* Author section */}
            <div className="border-t border-b py-6 my-8">
              <h3 className="font-semibold mb-2">About the Author</h3>
              <p className="text-sm text-muted-foreground">{report.authorBio}</p>
            </div>
            
            {/* Related reports */}
            {relatedReports.length > 0 && (
              <div className="my-8">
                <h3 className="text-xl font-semibold mb-4">Related Reports</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedReports.map((relatedReport) => (
                    <div 
                      key={relatedReport.id} 
                      className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                      onClick={() => navigate(`/research/reports/${relatedReport.slug}`)}
                    >
                      <h4 className="font-medium mb-2">{relatedReport.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {relatedReport.summary}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(new Date(relatedReport.date))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
      
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        currentUser={user}
        userProfile={profile}
      />
    </Layout>
  );
};

export default ReportDetailPage; 