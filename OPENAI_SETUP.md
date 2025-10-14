# OpenAI API Key Setup

## How to Add Your OpenAI API Key

1. **Open the backend/.env file** in your text editor
2. **Replace the placeholder** with your actual OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-openai-key-here
   ```
3. **Save the file**
4. **Restart the backend** (it should restart automatically with nodemon)

## What This Enables

With your OpenAI API key, you'll get:

✅ **Real AI-powered business analysis** - GPT-3.5-turbo understands natural language
✅ **Intelligent follow-up questions** - AI asks relevant clarifying questions
✅ **Smart business categorization** - Automatically categorizes your business type
✅ **Context-aware responses** - Remembers previous conversation context
✅ **Professional insights** - AI generates location-specific business insights

## Cost Information

- **GPT-3.5-turbo**: ~$0.002 per 1K tokens (very affordable)
- **Typical conversation**: ~$0.01-0.05 per search
- **Free tier**: $5 free credit when you sign up

## Fallback Mode

If no API key is provided, the app automatically falls back to intelligent mock responses that still work great for demos!

## Testing

Once you add your key, try these test inputs:
- "I want to open a coffee shop downtown"
- "Looking for a gym location with low competition"
- "Restaurant near universities for students"

The AI will intelligently analyze your input and provide smart recommendations!
