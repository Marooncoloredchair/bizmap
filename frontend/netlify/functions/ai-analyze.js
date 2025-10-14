const AIService = require('./aiService');
const aiService = new AIService();

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const data = JSON.parse(event.body);
    const { userInput, context: analysisContext, currentStep } = data;

    // Use mock AI service for now
    const analysis = await aiService.analyzeBusinessIntent(userInput, analysisContext);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        analysis,
        confidence_score: analysis.confidence_score,
        suggested_questions: analysis.suggested_questions || [],
        follow_up_question: analysis.follow_up_question || "Tell me more about your business idea!"
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
