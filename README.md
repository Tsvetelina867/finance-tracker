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
3. Configure the database:
- Create a MySQL database named *finance_db*.
- Update the application.properties file with your database credentials:
spring.datasource.url=jdbc:mysql://localhost:3306/finance_db
spring.datasource.username=your-username
spring.datasource.password=your-password

4. Build the backend using the Maven Wrapper
- On Windows:
mvnw.cmd clean install
- On macOS/Linux:
./mvnw clean install
5. Run the backend application
- On Windows: mvnw.cmd spring-boot:run
- On macOS/Linux: ./mvnw spring-boot:run


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


## API Documentation
The backend API is documented using Swagger. After running the backend, you can access the API documentation at: http://localhost:8080/swagger-ui.html  
The Swagger UI provides a detailed view of all the available endpoints 
