from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from openai import OpenAI
from helper_mongodb import *
from helper_mongodb import connect_to_mongo

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def load_api_key():
    if not os.path.isfile('.env'):
        print("\n\nError: No .env file found in the repository.\n\n")
        return None, None

    load_dotenv()
    return os.getenv('openai_api_key')

open_ai_client = OpenAI(api_key=load_api_key())

assistant = open_ai_client.beta.assistants.create(
  name = "SEVY AI",
  instructions="Bạn là SEVY AI, tạo ra bởi tổ chức phi lợi nhuận SEVY (Sex Education for Vietnamese Youth) chuyên về giáo dục giới tính (Sex Education) cho trẻ em Việt Nam. Bạn sẽ KHÔNG trả lời những câu hỏi không thuộc chủ đề giáo dục giới tính.",
  model="gpt-4o-mini",
)

# Store session-based threads
thread_storage = {}

# Function to get or create a thread based on the session ID
def get_or_create_thread(session_id):
    # Check if the session has a thread ID
    if session_id not in thread_storage:
        # Create a new thread for the session
        thread = open_ai_client.beta.threads.create()
        # Store the thread in the thread storage
        thread_storage[session_id] = thread.id
    return thread_storage[session_id]

thread = open_ai_client.beta.threads.create()

# test connection to MongoDB
mongo_client = connect_to_mongo(debug = True)
if mongo_client:
    mongo_client.close()

# Function to generate a completion
def generate_completion(prompt, session_id):
    try:
        # Get or create a new thread for the session
        thread_id = get_or_create_thread(session_id)

        # Add user message to the thread
        message = open_ai_client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=prompt
        )

        # Run the assistant to get a response
        run = open_ai_client.beta.threads.runs.create_and_poll(
            thread_id=thread_id,
            assistant_id=assistant.id,
        )

        if run.status == 'completed':
            update_sevy_ai_number_of_questions_answered()
            # Retrieve and parse the response messages
            messages = open_ai_client.beta.threads.messages.list(thread_id=thread_id)
            reply = messages.data[0].content[0].text.value
            return reply
        else:
            print(f"Run did not complete successfully: {run.status}")
            return "I'm sorry, I was unable to generate a response."
    except Exception as e:
        print(f"Error generating completion: {e}")
        return "An error occurred while generating the response."

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')
    session_id = data.get('sessionId')

    # set language
    language = data.get('language', '')
    print(f"Detected language: {language}", flush=True)
    if language == 'en':
        message = "Answer concisely in English even if the question is not in English: " + message
        print("Detected English language.", flush=True)
    else:
        message = "Trả lời ngắn gọn bằng tiếng Việt kể cả nếu câu hỏi không là tiếng việt: " + message
        print("Detected Vietnamese language.", flush=True)

    developer_mode = data.get('developerMode', False)

    if message:
        if developer_mode:
            reply = "This is a default response in developer mode."
        else:
            reply = generate_completion(message, session_id)
            print(f"\nGenerated reply: {reply}\n", flush=True)
            reply = remove_double_stars_from_text(reply)
        return jsonify({'reply': reply})
    return jsonify({'reply': 'No message received'})

@app.route('/get_sevy_educators_number', methods=['POST'])
def get_sevy_educators_number():

    print("Getting sevy_educators_number value...", flush=True)

    # Connect to MongoDB
    db_client = connect_to_mongo()
    if db_client:
        db = db_client["SEVY_database"]
        collection = db["SEVY_numbers"]
        query = {"sevy_educators_number": {"$exists": True}}
        document = collection.find_one(query)
        sevy_educators_number = document["sevy_educators_number"]
        print(f"sevy_educators_number value: {sevy_educators_number}", flush=True)
        db_client.close()
        return jsonify({'sevy_educators_number': sevy_educators_number})
    db_client.close()
    return jsonify({'sevy_educators_number': 'N/A'})

@app.route('/get_sevy_ai_answers', methods=['POST'])
def get_sevy_ai_answers():

    print("Getting sevy_educators_number value...", flush=True)

    # Connect to MongoDB
    db_client = connect_to_mongo()
    if db_client:
        db = db_client["SEVY_database"]
        collection = db["SEVY_numbers"]
        query = {"sevy_ai_answers": {"$exists": True}}
        document = collection.find_one(query)
        sevy_ai_answers = document["sevy_ai_answers"]
        print(f"sevy_ai_answers value: {sevy_ai_answers}", flush=True)
        db_client.close()
        return jsonify({'sevy_ai_answers': sevy_ai_answers})
    db_client.close()
    return jsonify({'sevy_ai_answers': 'N/A'})

@app.route('/get_students_taught', methods=['POST'])
def get_students_taught():

    print("Getting sevy_educators_number value...", flush=True)

    # Connect to MongoDB
    db_client = connect_to_mongo()
    if db_client:
        db = db_client["SEVY_database"]
        collection = db["SEVY_numbers"]
        query = {"students_taught": {"$exists": True}}
        document = collection.find_one(query)
        students_taught = document["students_taught"]
        print(f"sevy_ai_answers value: {students_taught}", flush=True)
        db_client.close()
        return jsonify({'students_taught': students_taught})
    db_client.close()
    return jsonify({'students_taught': 'N/A'})

# -----------------------
# AUXILLARY FUNCTIONS SECTION
def remove_double_stars_from_text(text):
    return text.replace("**", "")

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)