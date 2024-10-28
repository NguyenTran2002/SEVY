
# SEVY: AI-Powered Web Solution

![React](https://img.shields.io/badge/Frontend-React-blue)
![Backend](https://img.shields.io/badge/Backend-Flask-green)
![Docker](https://img.shields.io/badge/Deployment-Docker-yellow)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-teal)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?logo=amazon-web-services&logoColor=white)

Welcome to SEVY, an innovative, full-stack AI-powered solution deployed with modern technologies. This repository showcases the complete project, combining **React.js for the frontend** and **Flask for the backend**, with Docker-based deployment and MongoDB for persistent storage. Designed and deployed using AWS infrastructure, SEVY is built for scalability, efficiency, and delightful user interactions.

Our website is live at [sevyai.com](https://sevyai.com/).

---

## 🌟 Features
- **AI-Integrated Chat Box:** An intuitive chat box on the home page that utilizes SEVY AI to engage users, featuring a dynamic **loading bar** with JoyUI integration.
- **User-Friendly Design:** Clean and responsive frontend built with **React**.
- **Seamless Backend:** Python-powered **Flask API** to support robust server-side operations.
- **Database-Driven Architecture:** Uses **MongoDB** for data persistence.
- **Docker-Enabled Deployment:** All components are containerized using Docker, ensuring easy setup and deployment.
- **Environment-Ready Configuration:** Uses `.env` files to manage sensitive configurations and API tokens.

---

## 🚀 Quick Start

### Prerequisites
- Docker (will handle most other prerequisites)
- MongoDB instance (local or cloud)
- Relevant credentials through .env file (contact Nguyen Tran)

### Installation & Setup

#### Clone the Repository
```bash
git clone https://github.com/NguyenTran2002/SEVY.git
cd SEVY
```

#### Docker Setup
To run the entire stack using Docker:
```bash
docker-compose up --build
```

#### Obtain .env Files
To run the application, you need to obtain .env files containing relevant credentials from the author of this repository.
Alternatively, you can set up your own OpenAI API connection, MongoDB Database, and IPInfo API connection and fork this repository accordingly.

---

## 🛠️ Project Structure

```
SEVY/
├── LICENSE                   # Project license file
├── docker-compose.yml        # Docker orchestration file
├── python-backend/           # Backend service powered by Flask
│   ├── Dockerfile            # Dockerfile for backend container
│   ├── app.py                # Main Flask application entry point
│   ├── helper_mongodb.py     # MongoDB helper functions
│   ├── requirements.txt      # Backend dependencies
│   └── testing.ipynb         # Jupyter notebook for backend testing
└── react-frontend/           # Frontend application using React.js
    ├── Dockerfile            # Dockerfile for frontend container
    ├── package.json          # Frontend dependencies
    ├── public/               # Public assets for the frontend
    │   ├── images/           # Image resources
    │   └── index.html        # Main HTML template
    └── src/                  # React source code
```

---

## 📂 Key Technologies Used
- **Frontend:** React.js, JoyUI
- **Backend:** Flask (Python), MongoDB for data management
- **Deployment:** Docker, AWS EC2, AWS Load Balancer, NGINX
- **Security:** SSL/TLS certificates, Amazon Certificate Manager
- **Version Control:** Git
- **DevOps:** Docker containers, `docker-compose` for multi-service orchestration

---

## 🔑 Environment Variables
This project uses environment variables for sensitive data, such as:
- **API Tokens** (e.g. `OpenAI`, `IPinfo`)
- **Database Passwords** (e.g. `MongoDB`)

Ensure you create the required `.env` files in both the `react-frontend` and `python-backend` directories.

---

## 🧪 Testing
- The backend includes a **Jupyter notebook (`testing.ipynb`)** to help developers test the MongoDB integration and other backend logic.
- Frontend testing is planned for future releases, with tools like **Jest** in mind.

---

## 💡 Future Enhancements
- **Authentication system** with JWT or OAuth.
- **CI/CD integration** with GitHub Actions and AWS pipelines.
- **Unit testing** coverage across the stack.

---

## 📧 Contact
For inquiries, please reach out to Nguyen Tran, Director of Technology, SEVY: 
📧 [director.office@sevyai.com](mailto:director.office@sevyai.com)

---

## 🎉 Acknowledgments
Special thanks to the **SEVY Management Board** for their continuous support and guidance.
