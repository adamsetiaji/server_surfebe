# Surfebe Server

Node.js WebSocket server for the Surfebe application with a MySQL database.

## Features

- **User Management** (Create, Read, Update, Delete)
- **Recaptcha Management** (Create, Read, Update, Delete)
- **WebSocket Communication**
- **MySQL Database Support**

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [MySQL](https://www.mysql.com/) v8.0+
- [Docker](https://www.docker.com/) (optional, for containerized development)

## Installation

### Push to Github Repository
 ```bash
    git remote add origin https://github.com/adamsetiaji/server_surfebe.git

    git add .
    git commit -m "Initial commit: Add Update recaptchaController"
    git push -u origin master --force
   ```
---

### Pull from Github Repository
 ```bash
    git remote add origin https://github.com/adamsetiaji/server_surfebe.git

    git pull origin master
   ```
---



### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/adamsetiaji/server_surfebe.git
   cd server_surfebe
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**  
   Create a `.env` file and configure your MySQL database settings:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password
   DB_NAME=surfebeserver
   ```

4. **Run the server:**
   ```bash
   npm start
   ```
---

### Local Development (Using Docker)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/adamsetiaji/server_surfebe.git
   cd surfebeserver
   ```

2. **Set up environment variables:**  
   Create a `.env` file and configure your MySQL database settings:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password
   DB_NAME=surfebeserver
   ```

3. **Run the server docker:**
   ```bash
   docker-compose up --build
   ```

4. **Build Docker Image Local:**
   ```bash
   docker-compose build
   ```
---
### Tag and Push Docker Image to Docker Hub
 ```bash
    docker tag surfebeserver adamsetiaji/surfebeserver:latest
    docker push adamsetiaji/surfebeserver:latest

   ```
---

## WebSocket API Usage

### User Management

#### Create User
```json
{
    "type": "USER",
    "action": "CREATE",
    "data": {
        "name": "John Doe",
        "email": "john@example.com",
        "password_surfebe": "password123"
    }
}
```

#### Get All Users
```json
{
    "type": "USER",
    "action": "GET_ALL"
}
```

#### Get User by Email
```json
{
    "type": "USER",
    "action": "GET_BY_EMAIL",
    "email": "john@example.com"
}
```

#### Update User
```json
{
    "type": "USER",
    "action": "UPDATE",
    "email": "john@example.com",
    "data": {
        "name": "John Updated",
        "password_surfebe": "newpassword123"
    }
}
```

#### Delete User
```json
{
    "type": "USER",
    "action": "DELETE",
    "email": "john@example.com"
}
```

---

### Recaptcha Management

#### Create Recaptcha
```json
{
    "type": "RECAPTCHA",
    "action": "CREATE",
    "data": {
        "site": "example.com",
        "site_key": "6LdAbc123"
    }
}
```

#### Get All Recaptchas
```json
{
    "type": "RECAPTCHA",
    "action": "GET_ALL"
}
```

#### Get Token Recaptchas
```json
{
    "type": "RECAPTCHA",
    "action": "GET_TOKEN"
}
```

#### Get Recaptcha by Site Key
```json
{
    "type": "RECAPTCHA",
    "action": "GET_BY_SITE_KEY",
    "siteKey": "6LdAbc123"
}
```

#### Update Recaptcha
```json
{
    "type": "RECAPTCHA",
    "action": "UPDATE",
    "siteKey": "6LdAbc123",
    "data": {
        "site": "newsite.com",
        "g_response": "response_token",
        "status_g_response": 1,
        "time_g_response": "00:01:30"
    }
}
```

#### Delete Recaptcha
```json
{
    "type": "RECAPTCHA",
    "action": "DELETE",
    "siteKey": "6LdAbc123"
}
```

---

### Surfebe Management

#### register Surfebe
```json
{
    "type": "SURFEBE",
    "action": "REGISTER_SURFEBE",
    "email": "john@example.com",
    "siteKey": "6LdAbc123"
}
```

#### Login Surfebe
```json
{
    "type": "SURFEBE",
    "action": "LOGIN_SURFEBE",
    "email": "john@example.com",
    "siteKey": "6LdAbc123"
}
```

#### Confirm Captcha Surfebe
```json
{
    "type": "SURFEBE",
    "action": "CONFIRM_CAPTCHA",
    "email": "john@example.com",
    "siteKey": "6LdAbc123"
}
```

#### Get Profile Surfebe
```json
{
    "type": "SURFEBE",
    "action": "PROFILE_SURFEBE",
    "email": "john@example.com"
}
```

#### Get Tasks
```json
{
	"type": "SURFEBE",
	"action": "GET_TASKS",
	"version": "182",
	"email": "example@gmail.com"
}
```

#### Complete Visit
```json
{
	"type": "SURFEBE",
	"action": "COMPLETE_VISIT",
	"version": "182",
	"email": "example@gmail.com",
	"taskKey": "crgrtghrthrth=="
}
```
