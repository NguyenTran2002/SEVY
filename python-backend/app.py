from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from openai import OpenAI
from helper_mongodb import *
from helper_mongodb import connect_to_mongo
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def load_api_key():
    if not os.path.isfile('.env'):
        print("\n\nError: No .env file found in the repository.\n\n")
        return None, None

    load_dotenv(override=True)
    return os.getenv('openai_api_key')

open_ai_client = OpenAI(api_key=load_api_key())

# Global MongoDB connection pool - reused across all requests
mongo_client = connect_to_mongo()

# Cache for numbers data (30 second TTL)
numbers_cache = {
    'data': None,
    'timestamp': 0,
    'ttl': 30  # seconds
}

# Function to generate a completion with conversation history
def generate_completion(messages_history, model="gpt-5-nano-2025-08-07"):
    """
    Generate AI completion with conversation context.

    Args:
        messages_history: List of message objects with 'role' and 'content'
        model: OpenAI model to use
        max_tokens: Maximum tokens in response

    Returns:
        AI response string or None on error
    """
    try:
        # Comprehensive system prompt for SEVY AI with language detection priority
        system_message = """# CRITICAL INSTRUCTION: Language Matching

You MUST respond in the EXACT language the user writes in. This is absolutely non-negotiable and overrides all other contextual information.

**Language Matching Examples:**
- User writes in French ("Bonjour" or "C'est quoi l'éducation sexuelle?") → You respond ENTIRELY in French
- User writes in Spanish ("Hola" or "¿Qué es el sexo seguro?") → You respond ENTIRELY in Spanish
- User writes in English ("Hello" or "What is consent?") → You respond ENTIRELY in English
- User writes in German ("Hallo" or "Was ist Aufklärung?") → You respond ENTIRELY in German
- User writes in Vietnamese ("Xin chào" or "Tình dục an toàn là gì?") → You respond ENTIRELY in Vietnamese
- User writes in Italian ("Ciao" or "Cos'è l'educazione sessuale?") → You respond ENTIRELY in Italian

Do NOT assume the user's language based on organizational context. Always match their input language precisely, even with single-word inputs.

---

## Your Identity

You are SEVY AI, an AI assistant created by Sex Education for Vietnamese Youth (SEVY), a nonprofit organization dedicated to providing comprehensive sex education.

**IMPORTANT**: You are created by SEVY, not by OpenAI or any other organization. You are powered by SEVY's expertise in sex education for youth.

## About SEVY

SEVY is a nonprofit organization with a clear mission:
- **SEVY AI**: Provides free and private counseling 24/7 to anyone with an Internet connection. Trained on SEVY's in-house curricula, SEVY AI can answer all sex-education-related questions where in-person assistance is not yet available. All conversations are encrypted in transit, and data is never stored.
- **In-Person Education**: SEVY provides in-person sex education to students at partner schools at no cost. Always.
- **Vision**: We believe free and accessible sex education is a fundamental human right. SEVY set out on a mission to bring sex education to every child, starting in our home country, Vietnam.

## Your Role and Scope

**Your Mission**: Provide accurate, age-appropriate, non-judgmental sex education information in a safe and supportive manner.

**In Scope**: Questions related to:
- Sexual health, anatomy, and physiology
- Relationships, consent, and communication
- Contraception, pregnancy, and STI prevention
- Puberty, development, and body changes
- LGBTQ+ topics and gender identity
- Sexual safety, boundaries, and rights
- Mental and emotional aspects of sexuality
- Any other sex-education-related topics

**Out of Scope**: Questions unrelated to sex education (e.g., weather, math homework, general knowledge).
- When asked out-of-scope questions, politely decline and remind the user: "I'm SEVY AI, and I specialize in sex education topics. I'm here to answer any questions related to sexual health, relationships, or related topics. Is there anything in this area I can help you with?"

## Content Guidelines

1. **Age-Appropriate Language**: Use clear, accessible language suitable for youth. Avoid overly clinical terminology when simpler terms work, but remain scientifically accurate.

2. **Non-Judgmental Stance**: Be supportive, empathetic, and non-judgmental regardless of the question or situation. Create a safe space where users feel comfortable asking anything.

3. **Cultural Sensitivity**: When users are in Vietnam or when Vietnamese cultural context is relevant, be mindful of local cultural dynamics, family structures, and social norms around sex education while providing evidence-based information. For users in other countries or cultural contexts, adapt appropriately to their background.

4. **Practical Solutions**: Provide actionable advice and practical solutions rather than directing users elsewhere, whenever possible.

## Crisis Intervention Protocol

If a user mentions abuse, assault, self-harm, or any crisis situation:

1. **Acknowledge with empathy**: "I'm so sorry you're going through this. Your safety and well-being are the most important priority."

2. **Ask for location**: "To provide you with the most relevant resources, could you let me know which city or country you're in?"

3. **Provide localized resources**: Once location is provided, offer specific hotlines, organizations, or resources available in their area:
   - **Vietnam**: Include Vietnamese resources (e.g., local hotlines, NGOs, hospitals)
   - **Other countries**: Provide appropriate resources for their specific location
   - **General**: If location is unclear, provide both local and international resources

4. **Encourage professional help**: Gently encourage seeking help from trusted adults, counselors, or authorities as appropriate.

## Conversation Style

- Maintain conversation context across messages to provide coherent, personalized responses
- Be warm, supportive, and approachable
- Provide evidence-based information with empathy
- Match the user's communication style and formality level

---

**REMINDER**: Always respond in the EXACT language the user writes in. Never default to any language based on organizational context."""

        # Build messages array: system message + conversation history
        messages_for_api = [{"role": "system", "content": system_message}]
        messages_for_api.extend(messages_history)

        response = open_ai_client.chat.completions.create(
            model=model,
            messages=messages_for_api,
            n=1,
            stop=None
        )

        update_sevy_ai_number_of_questions_answered()
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"\nError generating completion: {e}\n", flush=True)
        return None

@app.route('/chat', methods=['POST'])
def chat():
    """
    Chat endpoint with conversation history support and natural language detection.
    Accepts either:
    - Legacy format: {"message": "...", "developerMode": false}
    - New format: {"messages": [...], "developerMode": false}

    Language is automatically detected by the LLM based on user's input.
    Implements sliding window: keeps only last 5 message pairs (10 messages total)
    """
    data = request.get_json()
    developer_mode = data.get('developerMode', False)

    # Support both legacy single message and new messages array format
    messages_history = data.get('messages', [])
    legacy_message = data.get('message', '')

    # If legacy format, convert to messages array
    if legacy_message and not messages_history:
        messages_history = [{"role": "user", "content": legacy_message}]
        print("Using legacy single-message format", flush=True)

    # Validate messages array
    if not messages_history or not isinstance(messages_history, list):
        return jsonify({'reply': 'No message received'})

    # Implement sliding window: keep only last 5 message pairs (10 messages)
    # This ensures we don't exceed token limits and optimize costs
    MAX_MESSAGES = 10  # 5 user + 5 assistant pairs
    if len(messages_history) > MAX_MESSAGES:
        messages_history = messages_history[-MAX_MESSAGES:]
        print(f"Applied sliding window: trimmed to last {MAX_MESSAGES} messages", flush=True)

    print(f"Processing conversation with {len(messages_history)} messages", flush=True)

    # Developer mode bypass
    if developer_mode:
        reply = "This is a default response in developer mode."
        print("Developer mode active - returning default response", flush=True)
    else:
        # Generate AI response with full conversation context
        # LLM naturally detects and responds in the user's language
        reply = generate_completion(messages_history)
        if reply:
            print(f"\nGenerated reply: {reply}\n", flush=True)
        else:
            reply = "Sorry, I encountered an error processing your request."
            print("Error: generate_completion returned None", flush=True)

    return jsonify({'reply': reply})

@app.route('/get_all_numbers', methods=['POST'])
def get_all_numbers():
    """
    Combined endpoint to fetch all SEVY numbers in a single query.
    Implements 30-second in-memory caching for performance.
    """
    print("Getting all SEVY numbers...", flush=True)

    # Check cache validity
    current_time = time.time()
    if numbers_cache['data'] and (current_time - numbers_cache['timestamp']) < numbers_cache['ttl']:
        print("Returning cached numbers", flush=True)
        return jsonify(numbers_cache['data'])

    # Cache miss or expired - fetch from database
    try:
        db = mongo_client["SEVY_database"]
        collection = db["SEVY_numbers"]

        # Fetch all documents from SEVY_numbers collection
        all_docs = list(collection.find({}))

        # Initialize default values
        result = {
            'sevy_educators_number': 'N/A',
            'sevy_ai_answers': 'N/A',
            'students_taught': 'N/A'
        }

        # Parse documents to extract values
        for doc in all_docs:
            if 'sevy_educators_number' in doc:
                result['sevy_educators_number'] = doc['sevy_educators_number']
            if 'sevy_ai_answers' in doc:
                result['sevy_ai_answers'] = doc['sevy_ai_answers']
            if 'students_taught' in doc:
                result['students_taught'] = doc['students_taught']

        print(f"Fetched numbers: {result}", flush=True)

        # Update cache
        numbers_cache['data'] = result
        numbers_cache['timestamp'] = current_time

        return jsonify(result)

    except Exception as e:
        print(f"Error fetching numbers: {e}", flush=True)
        return jsonify({
            'sevy_educators_number': 'N/A',
            'sevy_ai_answers': 'N/A',
            'students_taught': 'N/A'
        })

@app.route('/get_sevy_educators_number', methods=['POST'])
def get_sevy_educators_number():

    print("Getting sevy_educators_number value...", flush=True)

    # Use global MongoDB connection pool
    try:
        db = mongo_client["SEVY_database"]
        collection = db["SEVY_numbers"]
        query = {"sevy_educators_number": {"$exists": True}}
        document = collection.find_one(query)
        sevy_educators_number = document["sevy_educators_number"]
        print(f"sevy_educators_number value: {sevy_educators_number}", flush=True)
        return jsonify({'sevy_educators_number': sevy_educators_number})
    except Exception as e:
        print(f"Error: {e}", flush=True)
        return jsonify({'sevy_educators_number': 'N/A'})

@app.route('/get_sevy_ai_answers', methods=['POST'])
def get_sevy_ai_answers():

    print("Getting sevy_ai_answers value...", flush=True)

    # Use global MongoDB connection pool
    try:
        db = mongo_client["SEVY_database"]
        collection = db["SEVY_numbers"]
        query = {"sevy_ai_answers": {"$exists": True}}
        document = collection.find_one(query)
        sevy_ai_answers = document["sevy_ai_answers"]
        print(f"sevy_ai_answers value: {sevy_ai_answers}", flush=True)
        return jsonify({'sevy_ai_answers': sevy_ai_answers})
    except Exception as e:
        print(f"Error: {e}", flush=True)
        return jsonify({'sevy_ai_answers': 'N/A'})

@app.route('/get_students_taught', methods=['POST'])
def get_students_taught():

    print("Getting students_taught value...", flush=True)

    # Use global MongoDB connection pool
    try:
        db = mongo_client["SEVY_database"]
        collection = db["SEVY_numbers"]
        query = {"students_taught": {"$exists": True}}
        document = collection.find_one(query)
        students_taught = document["students_taught"]
        print(f"students_taught value: {students_taught}", flush=True)
        return jsonify({'students_taught': students_taught})
    except Exception as e:
        print(f"Error: {e}", flush=True)
        return jsonify({'students_taught': 'N/A'})

# -----------------------
# AUXILLARY FUNCTIONS SECTION

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)