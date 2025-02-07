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

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd surfebeserver
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**  
   Create a `.env` file and configure your MySQL database settings:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password
   DB_NAME=surfebe
   ```

4. **Run the server:**
   ```bash
   npm start
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

## License

This project is licensed under the **MIT License**.
