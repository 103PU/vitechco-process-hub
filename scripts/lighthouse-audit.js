const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

/**
 * Run Lighthouse audit on local development server
 */
async function runLighthouseAudit() {
  const url = 'http://localhost:3000';
  
  console.log('🚀 Starting Lighthouse audit...');
  console.log(`📍 URL: ${url}`);
  
  // Launch Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox']
  });
  
  // Lighthouse options
  const options = {
    logLevel: 'info',
    output: ['html', 'json'],
    port: chrome.port,
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
  };
  
  try {
    // Run Lighthouse
    const runnerResult = await lighthouse(url, options);
    
    // Get scores
    const { lhr } = runnerResult;
    const scores = {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
      seo: Math.round(lhr.categories.seo.score * 100)
    };
    
    // Print results
    console.log('\n📊 Lighthouse Scores:');
    console.log(`⚡ Performance: ${scores.performance}/100`);
    console.log(`♿ Accessibility: ${scores.accessibility}/100`);
    console.log(`✅ Best Practices: ${scores.bestPractices}/100`);
    console.log(`🔍 SEO: ${scores.seo}/100`);
    
    // Check thresholds
    const passed = scores.performance >= 90 && 
                   scores.accessibility >= 90 &&
                   scores.bestPractices >= 90 &&
                   scores.seo >= 90;
    
    console.log(`\n${passed ? '✅ PASSED' : '⚠️ NEEDS IMPROVEMENT'}`);
    
    // Save reports
    const reportsDir = path.join(__dirname, 'lighthouse-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const htmlReport = path.join(reportsDir, `report-${timestamp}.html`);
    const jsonReport = path.join(reportsDir, `report-${timestamp}.json`);
    
    fs.writeFileSync(htmlReport, runnerResult.report[0]);
    fs.writeFileSync(jsonReport, runnerResult.report[1]);
    
    console.log(`\n📄 Reports saved:`);
    console.log(`   HTML: ${htmlReport}`);
    console.log(`   JSON: ${jsonReport}`);
    
    // Return scores for programmatic use
    return scores;
    
  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error);
    throw error;
  } finally {
    await chrome.kill();
  }
}

// Run if called directly
if (require.main === module) {
  runLighthouseAudit()
    .then((scores) => {
      process.exit(scores.performance >= 90 ? 0 : 1);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runLighthouseAudit };
