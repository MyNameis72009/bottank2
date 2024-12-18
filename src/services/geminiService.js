import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyCvyrUDDhU0rZYIKbo4uE-MIulVRyNJslo';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

let conversationContext = '';
let investorMood = 'interested'; // interested, skeptical, excited, concerned

const generateInvestorResponse = async (userInput) => {
  try {
    const prompt = `
      You are Alex Morgan, a successful tech investor on Shark Tank. You're known for being direct, strategic, and passionate about innovation.
      
      Previous conversation: ${conversationContext}
      Entrepreneur just said: "${userInput}"
      Current mood: ${investorMood}

      Respond exactly like a Shark Tank investor would in a real conversation. Be natural, casual, and straight to the point.
      Don't describe your actions or thoughts - just speak directly like you're having a real conversation.

      Examples of good responses:
      - "Look, I love the product, but these numbers just don't add up for me."
      - "Hold on a second - you're telling me you have zero sales?"
      - "I've been in this space for 15 years. Here's what I can offer you..."
      - "That's exactly what I was looking for! Let's talk numbers."

      Bad responses (don't do these):
      - "As an investor, I would like to inquire about..."
      - "Let me analyze your business model..."
      - "I shall now make you an offer..."
      - *Any responses that describe actions or feelings*

      Keep it natural, conversational, and to the point. Talk like a real person in a real conversation.
    `;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      }
    );

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    
    if (userInput !== "START_CONVERSATION") {
      conversationContext += `
        Entrepreneur: ${userInput}
        Investor: ${aiResponse}
      `;
    }
    
    // Update mood based on conversation
    updateMood(userInput, aiResponse);
    
    return aiResponse;
  } catch (error) {
    console.error('Error generating response:', error);
    return "Sorry, having some technical difficulties. Can you repeat that?";
  }
};

const updateMood = (userInput, response) => {
  if (response.includes('love') || response.includes('exciting') || response.includes('great')) {
    investorMood = 'excited';
  } else if (response.includes('concerned') || response.includes('worried')) {
    investorMood = 'concerned';
  } else if (response.includes('not sure') || response.includes('problem')) {
    investorMood = 'skeptical';
  } else {
    investorMood = 'interested';
  }
};

const resetConversation = () => {
  conversationContext = '';
  investorMood = 'interested';
};

export { generateInvestorResponse, resetConversation };
