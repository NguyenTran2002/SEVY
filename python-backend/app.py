from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from openai import OpenAI

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def load_api_key():
    if not os.path.isfile('.env'):
        print("\n\nError: No .env file found in the repository.\n\n")
        return None, None

    load_dotenv()
    return os.getenv('openai_api_key')

client = OpenAI(api_key=load_api_key())

# Function to generate a completion
def generate_completion(prompt, model="gpt-4o-mini", max_tokens=1000):
    try:
        response = client.chat.completions.create(model=model,
        messages=[
            {"role": "system", "content": "Bạn là SEVY AI, tạo ra bởi tổ chức phi lợi nhuận SEVY chuyên về giáo dục giới tính cho học sinh Việt Nam."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=max_tokens,
        n=1,
        stop=None,
        temperature=0.7)
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating completion: {e}")
        return None

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')

    # set language
    language = data.get('language', '')
    print(f"Detected language: {language}", flush=True)
    if language == 'en':
        message = "Answer concisely: " + message
        print("Detected English language.", flush=True)
    else:
        message = "Trả lời ngắn gọn: " + message
        print("Detected Vietnamese language.", flush=True)

    developer_mode = data.get('developerMode', False)

    if message:
        if developer_mode:
            reply = "This is a default response in developer mode."
        else:
            reply = generate_completion(message)
            reply = remove_double_stars_from_text(reply)
        print(f"\nGenerated reply: {reply}\n", flush=True)
        return jsonify({'reply': reply})
    return jsonify({'reply': 'No message received'})

# -----------------------
# AUXILLARY FUNCTIONS SECTION
def remove_double_stars_from_text(text):
    return text.replace("**", "")

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)