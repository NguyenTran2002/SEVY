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
def generate_completion(messages_history, language='vi', model="gpt-4.1-nano-2025-04-14", max_tokens=1000):
    """
    Generate AI completion with conversation context.

    Args:
        messages_history: List of message objects with 'role' and 'content'
        language: 'en' or 'vi' to set response language
        model: OpenAI model to use
        max_tokens: Maximum tokens in response

    Returns:
        AI response string or None on error
    """
    try:
        # Base system message (Vietnamese sex education assistant)
        base_system_message = "Bạn là trợ lý ảo SEVY AI, tạo ra bởi tổ chức phi lợi nhuận SEVY chuyên về giáo dục giới tính (Sex Education) cho trẻ em Việt Nam. Bạn sẽ KHÔNG trả lời những câu hỏi không thuộc chủ đề giáo dục giới tính. Nhiệm vụ của bạn là tạo cho người hỏi cảm giác an toàn và tin tưởng. Cố gắng đưa cho người hỏi giải pháp thực tế thay vì bảo họ tìm đến nơi khác để giải đáp thắc mắc."

        # Add language instruction to system message
        if language == 'en':
            system_message = base_system_message + " IMPORTANT: Answer in English even if the question is not in English."
        else:
            system_message = base_system_message + " QUAN TRỌNG: Trả lời bằng tiếng Việt kể cả nếu câu hỏi không là tiếng Việt."

        # Build messages array: system message + conversation history
        messages_for_api = [{"role": "system", "content": system_message}]
        messages_for_api.extend(messages_history)

        response = open_ai_client.chat.completions.create(
            model=model,
            messages=messages_for_api,
            max_tokens=max_tokens,
            n=1,
            stop=None,
            temperature=0.7
        )

        update_sevy_ai_number_of_questions_answered()
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"\nError generating completion: {e}\n", flush=True)
        return None

@app.route('/chat', methods=['POST'])
def chat():
    """
    Chat endpoint with conversation history support.
    Accepts either:
    - Legacy format: {"message": "...", "language": "...", "developerMode": false}
    - New format: {"messages": [...], "language": "...", "developerMode": false}

    Implements sliding window: keeps only last 5 message pairs (10 messages total)
    """
    data = request.get_json()
    language = data.get('language', 'vi')
    developer_mode = data.get('developerMode', False)

    print(f"Detected language: {language}", flush=True)

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
        reply = generate_completion(messages_history, language=language)
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