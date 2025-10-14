const AIService = require('./aiService');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const aiService = new AIService();
    
    // Test with a simple barbershop query
    const testResult = await aiService.analyzeBusinessIntent('I want to open a barbershop downtown', {});
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        testResult,
        message: 'AI service is working correctly'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: error.message,
        stack: error.stack
      })
    };
  }
};
