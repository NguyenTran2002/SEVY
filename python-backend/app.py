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

# test connection to MongoDB
mongo_client = connect_to_mongo(debug = True)
if mongo_client:
    mongo_client.close()

# Function to generate a completion
def generate_completion(prompt, model="gpt-4.1-nano-2025-04-14", max_tokens=1000):
    try:
        response = open_ai_client.chat.completions.create(model=model,
        messages=[
            {"role": "system", "content": "Bạn là trợ lý ảo SEVY AI, tạo ra bởi tổ chức phi lợi nhuận SEVY chuyên về giáo dục giới tính (Sex Education) cho trẻ em Việt Nam. Bạn sẽ KHÔNG trả lời những câu hỏi không thuộc chủ đề giáo dục giới tính. Nhiệm vụ của bạn là tạo cho người hỏi cảm giác an toàn và tin tưởng. Cố gắng đưa cho người hỏi giải pháp thực tế thay vì bảo họ tìm đến nơi khác để giải đáp thắc mắc."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=max_tokens,
        n=1,
        stop=None,
        temperature=0.7)
        update_sevy_ai_number_of_questions_answered()
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"\nError generating completion: {e}\n", flush=True)
        return None

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')

    # set language
    language = data.get('language', '')
    print(f"Detected language: {language}", flush=True)
    if language == 'en':
        message = "Answer in English even if the question is not in English: " + message
        print("Detected English language.", flush=True)
    else:
        message = "Trả lời bằng tiếng Việt kể cả nếu câu hỏi không là tiếng Việt: " + message
        print("Detected Vietnamese language.", flush=True)

    developer_mode = data.get('developerMode', False)

    if message:
        if developer_mode:
            reply = "This is a default response in developer mode."
        else:
            reply = generate_completion(message)
            print(f"\nGenerated reply: {reply}\n", flush=True)
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

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)