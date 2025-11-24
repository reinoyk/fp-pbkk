<div id="top">

<div align="center">
 
# DIGITAL-LIBRARY-API

*High-Performance REST API for Digital Book Management*

<p align="center">
<img src="https://img.shields.io/github/last-commit/reinoyk/fp-pbkk?style=flat&logo=git&logoColor=white&color=00ADD8" alt="last-commit">
<img src="https://img.shields.io/badge/Go-1.20+-00ADD8?style=flat&logo=go&logoColor=white" alt="Go Version">
<img src="https://img.shields.io/badge/Framework-Gin-00ADD8?style=flat&logo=go&logoColor=white" alt="Gin Framework">
<img src="https://img.shields.io/badge/ORM-Gorm-red?style=flat" alt="Gorm">
<img src="https://img.shields.io/badge/Database-MySQL-blue?style=flat&logo=mysql&logoColor=white" alt="MySQL">
</p>

<em>Built with Golang, Gin, Gorm, and MySQL</em>

</div>
---

## Table of Contents

* [Overview](#overview)
* [Key Features](#key-features)
* [Tech Stack](#tech-stack)
* [System Architecture](#system-architecture)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Database Setup](#database-setup)
  * [Configuration](#configuration)
* [Project Structure](#project-structure)
* [API Endpoints](#api-endpoints)
* [How to Contribute](#how-to-contribute)
* [License](#license)

---

## Overview

**Digital-Library-API** is a robust backend service designed to manage a digital library catalog. Built using **Golang** for high concurrency and performance, this project utilizes the **Gin Web Framework** for fast routing and **Gorm** as the ORM for seamless MySQL database interaction.

The system is architected with modularity in mind, separating configuration logic from core business processing. Currently pre-populated with a structured dataset of popular books, the ongoing development focuses on implementing secure **JWT-based Authentication** and comprehensive **CRUD (Create, Read, Update, Delete)** operations to serve as a reliable backbone for library management applications.

---

## Key Features

* 🚀 **High-Performance Routing:** Powered by Gin, offering blazing fast HTTP request handling.
* 🗄️ **ORM Integration:** Uses Gorm for type-safe, developer-friendly interactions with the MySQL database.
* 🔐 **Secure Authentication (In Progress):** Implementation of JSON Web Tokens (JWT) for stateless user authentication and role-based authorization.
* 📚 **CRUD Operations:** Full management capabilities for book catalogs (Add, Browse, Edit, Remove).
* 🧩 **Modular Architecture:** Clean separation of concerns (Config, Models, Controllers, Routes) for maintainability.
* 🛢️ **Structured Data:** Includes a pre-connected schema populated with popular book data.

---

## Tech Stack

* **Language:** [Go (Golang)](https://go.dev/)
* **Framework:** [Gin](https://github.com/gin-gonic/gin)
* **ORM:** [Gorm](https://gorm.io/)
* **Database:** MySQL (Managed via XAMPP/TablePlus)
* **Authentication:** JWT (JSON Web Token)
* **Environment Management:** Godotenv

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:

* **Go** (version 1.18 or higher)
* **XAMPP** (for local MySQL server)
* **TablePlus** or **phpMyAdmin** (for database management)
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

3.  **Install dependencies:**

    ```sh
    go mod tidy
    ```

### Database Setup

1.  Start **Apache** and **MySQL** from your XAMPP Control Panel.
2.  Open **TablePlus** (or your preferred DB tool).
3.  Create a new database named `digital_library` (or as specified in the config).
4.  *Optional:* If a `.sql` file is provided in the `database/` folder, import it to seed initial book data.

### Configuration

1.  Create a `.env` file in the root directory based on the example below:

    ```env
    DB_USER=root
    DB_PASSWORD=
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_NAME=digital_library
    
    JWT_SECRET=your_very_secret_key
    PORT=8080
    ```

---

## Usage

1.  **Run the application:**

    ```sh
    go run main.go
    ```

2.  **Access the API:**
    The server will start on `http://localhost:8080`.

---

## Project Structure

The project follows a modular structure to ensure scalability:

```text
fp-pbkk/
├── config/             # Database configuration and environment setup
│   └── database.go
├── controllers/        # Logic for handling requests (BookController, AuthController)
├── models/             # Structs and Gorm models (Book, User)
├── routes/             # API Route definitions
├── main.go             # Entry point of the application
├── go.mod              # Go module definition
├── .env                # Environment variables
└── README.md           # Documentation
```
