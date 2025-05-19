# Personal Finance Tracker
This is a **Personal Finance Tracker Application** designed to help users track their income, expenses, budgets, and financial goals. The application provides a user-friendly interface for managing transactions, recurring payments, and budgets, as well as visualizing spending patterns through charts.


## Features
- **User Authentication**: Secure login and registration using JWT.
- **Account Management**: Users can manage multiple accounts.
- **Transactions**: Track and filter transactions by date range.
- **Recurring Transactions**: Manage and view active and past recurring payments.
- **Budgeting**: Set and track budgets with progress visualization.
- **Goals**: Set financial goals and track progress.
- **Spending Chart**: Visualize spending over time using interactive chart.
- **Real-Time Currency Exchange**: When an account is set to a specific currency (e.g., USD), any transaction added in a different currency (e.g., EUR) will be automatically converted to the account's currency using real-time exchange rates.


---


## Technologies Used
### Frontend
- **React**: A JavaScript library for building user interfaces.
- **Recharts**: For visualizing spending data with interactive charts.
- **JavaScript**: Used alongside React for frontend logic and interactions.
- **CSS**: For styling the application.

### Backend
- **Java**: Primary programming language.
- **Spring Framework**: For building the backend API.
- **Spring Security**: For authentication and authorization.
- **MySQL**: Relational database for storing data.
- **JWT (JSON Web Tokens)**: For secure user authentication.
- **Exchange Rates API**: For currency conversion.

### Tools
- **Git**: Version control.
- **Postman**: For API testing.


---


## Installation
Follow these steps to set up the project locally:

### Prerequisites
- Java Development Kit (JDK) 21.
- MySQL Server.
- Node.js and npm (for the frontend).

### Backend Setup
1. Clone the repository:
   git clone https://github.com/Tsvetelina867/finance-tracker.git
2. Navigate to the project directory:
   cd finance-tracker
3. Configure your environment variables (see Environment Variables below).
4. Update src/main/resources/application.properties or provide environment variables with your DB credentials and API keys.

5. Build and run the backend:
Windows:
``mvnw.cmd clean install
mvnw.cmd spring-boot:run``

macOS/Linux:
``./mvnw clean install
./mvnw spring-boot:run``

Backend runs on http://localhost:8080 by default.

---


### Frontend Setup
1. Navigate to the frontend directory
cd frontend
2. Install dependencies
npm install
3. Start the frontend development server
npm start
4. Open your browser and visit http://localhost:3000.


----
## Environment Variables

Before running the backend, configure the following environment variables to connect your database, set security keys, and API keys:

| Variable Name      | Purpose                                 | Default Value or Example                                                                                 |
|--------------------|-----------------------------------------|----------------------------------------------------------------------------------------------------------|
| `DB_URL`           | MySQL JDBC connection URL                | `jdbc:mysql://localhost:3306/finance_tracker?allowPublicKeyRetrieval=true&useSSL=false`                   |
| `DB_USERNAME`      | MySQL username                          | `root`                                                                                                   |
| `DB_PASSWORD`      | MySQL password                          | *(empty by default)*                                                                                      |
| `JWT_SECRET`       | Secret key used to sign JWT tokens      | `changeme`                                                                                               |
| `JWT_EXPIRATION`   | JWT token expiration time in milliseconds | `2592000000` (30 days)                                                                                   |
| `EXCHANGE_API_BASE`| Base URL for currency exchange API      | `https://api.freecurrencyapi.com/v1/latest`                                                              |
| `EXCHANGE_API_KEY` | API key for currency exchange API       | `demo_key`                                                                                               |


----

## API Documentation
The backend API is documented using Swagger. After running the backend, you can access the API documentation at: http://localhost:8080/swagger-ui.html  
The Swagger UI provides a detailed view of all the available endpoints 
