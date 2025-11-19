<div id="top">

<div align="center">
 
# WEBNOVEL-RECOMMENDATION-SYSTEM

*Intelligent Content Discovery Powered by Graph Databases & LLMs*

<p align="center">
<img src="https://img.shields.io/github/last-commit/reinoyk/fp-pbkk?style=flat&logo=git&logoColor=white&color=0080ff" alt="last-commit">
<img src="https://img.shields.io/github/languages/top/reinoyk/fp-pbkk?style=flat&color=0080ff" alt="repo-top-language">
<img src="https://img.shields.io/github/languages/count/reinoyk/fp-pbkk?style=flat&color=0080ff" alt="repo-language-count">
<img src="https://img.shields.io/badge/Neo4j-Graph_Database-blue" alt="Neo4j">
<img src="https://img.shields.io/badge/LLM-Google_Gemini-orange" alt="Gemini">
</p>

<em>Built with Python, Flask, Neo4j, LangChain, and Google Gemini</em>

</div>
---

## Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [System Architecture](#system-architecture)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Configuration](#configuration)
* [Usage](#usage)
* [Project Structure](#project-structure)
* [How to Contribute](#how-to-contribute)
* [License](#license)

---

## Overview

**WebNovel Recommendation System** is an advanced full-stack application designed to revolutionize how users discover reading content. By leveraging the structural power of **Graph Databases (Neo4j)** and the cognitive capabilities of **Large Language Models (LLMs)**, this system goes beyond simple keyword matching.

The core of the project is a "NeoConverse" style integration where **LangChain** and **Google Gemini** translate natural language user queries directly into executable Cypher code. This allows users to converse with the database to find novels based on complex relationships between authors, genres, and tags, alongside a traditional hybrid recommendation logic based on metadata similarity.

---

## Features

* 🕸️ **Graph-Based Modeling:** Utilizes Neo4j to model complex relationships between Novels, Authors, Genres, and Tags for deep interconnected data analysis.
* 🤖 **Natural Language Querying (Text-to-Cypher):** Users can ask questions like *"Find me fantasy novels with strong protagonists"* and the system converts this into optimized Cypher queries using Google Gemini.
* 🧠 **Hybrid Recommendation Engine:** Calculates similarity scores based on shared metadata to suggest relevant content even without specific prompts.
* 📊 **Interactive Dashboard:** A responsive Single Page Application (SPA) dashboard for visualizing recommendations and exploring the novel database.
* ⚡ **Robust API:** A Python Flask backend that handles data processing, LLM chain management, and API responses.

---

## Tech Stack

* **Backend:** Python, Flask
* **Database:** Neo4j (Graph Database)
* **AI & LLM:** LangChain, Google Gemini (API)
* **Frontend:** HTML, CSS, JavaScript (SPA)
* **Data Processing:** Pandas, NumPy

---

## System Architecture

The system follows a modern client-server architecture:
1.  **Client:** The SPA Dashboard sends user prompts or navigation requests to the API.
2.  **Server (Flask):** Receives requests and determines the logic flow (Standard Search vs. AI Query).
3.  **LangChain Integration:** For AI queries, the prompt is passed to the LangChain agent configured with the Google Gemini model.
4.  **Graph Execution:** The LLM generates a Cypher query, which is executed against the Neo4j database.
5.  **Response:** Structured data (Novel nodes and relationships) is returned to the frontend for display.

---

## Getting Started

### Prerequisites

* **Python 3.9+**
* **Neo4j Database:** You need a running instance of Neo4j (Desktop or AuraDB).
* **Google Cloud API Key:** Access to Google Gemini models.
* **Git**

### Installation

1.  **Clone the repository:**

    ```sh
    git clone [https://github.com/reinoyk/fp-pbkk.git](https://github.com/reinoyk/fp-pbkk.git)
    ```

2.  **Navigate to the project directory:**

    ```sh
    cd fp-pbkk
    ```

3.  **Install the dependencies:**

    ```sh
    pip install -r requirements.txt
    ```

### Configuration

1.  Create a `.env` file in the root directory.
2.  Add your database credentials and API keys:

    ```env
    NEO4J_URI=bolt://localhost:7687
    NEO4J_USERNAME=neo4j
    NEO4J_PASSWORD=your_password
    GOOGLE_API_KEY=your_google_gemini_api_key
    ```

3.  **Database Setup:**
    * Ensure your Neo4j instance is running.
    * Import your initial dataset (CSV/JSON) into Neo4j using the provided scripts in `scripts/` or via Neo4j Browser.

---

## Usage

1.  **Start the Flask Server:**

    ```sh
    python app.py
    ```

2.  **Access the Dashboard:**
    * Open your web browser and navigate to `http://localhost:5000` (or the port specified in your console).

3.  **Example Queries:**
    * *Standard Mode:* Browse the top-rated novels or filter by tags.
    * *AI Mode:* Type in the chat bar:
        > "Recommend me a mystery novel written by an author who also writes horror."
        > "Show me the top 5 trending novels in the Fantasy genre."

---

## Project Structure

```text
fp-pbkk/
├── app.py              # Main Flask application entry point
├── requirements.txt    # Python dependencies
├── .env                # Environment variables (not committed)
├── static/             # CSS, JS, and Images for the dashboard
│   ├── css/
│   └── js/
├── templates/          # HTML templates
│   └── index.html
├── modules/            # Python modules for logic
│   ├── db_connector.py # Neo4j connection logic
│   ├── llm_chain.py    # LangChain & Gemini integration
│   └── recommender.py  # Similarity algorithms
└── data/               # Dataset files (if applicable)
