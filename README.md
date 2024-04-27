Sole Mates
Welcome to Sole Mates, an ecommerce web application dedicated to selling shoes. This project aims to provide a smooth and intuitive shopping experience using the latest web technologies.

Technologies
Frontend: React 18.2.0
Backend: .NET 8
Database: SQL (e.g., MySQL, PostgreSQL)
Image Storage: Firebase (for now, but can be extended to store images in the database directly or in a cloud storage solution compatible with Docker)
Authentication: JWT Tokens
Containerization: Docker
Features
User Authentication:
Users can register and log in using email/password or via Google OAuth.
JWT tokens are issued upon successful authentication for subsequent API requests.
Authorization based on user roles: User and StoreOwner.
Database Setup:
Utilize SQL database (e.g., MySQL, PostgreSQL) for storing user information, product details, orders, etc.
Dockerize the database for easy setup and deployment.
Product Management:
CRUD operations for products accessible only to StoreOwners.
Implement filtering functionality based on product properties.
Allow users to search for products by name.
Order Management:
Store orders in the database with details like email, orderId, products ordered, etc.
Users can search for orders by email or orderId.
StoreOwners can view a list of orders, confirm, or cancel orders.
User Profile Management:
Users can upload a profile image, update their name, address, and phone number.
Profile information is stored securely in the database.
Setup
Clone the Repository: Clone the Sole Mates repository to your local machine.
Dependencies Installation:
Navigate to the frontend and backend directories and install dependencies for React and .NET respectively.
Install necessary packages/modules for JWT authentication and database connectivity.
Database Setup:
Use Docker to set up and run the SQL database container. Make sure to configure it with the appropriate database schema.
Authentication Setup:
Implement JWT token-based authentication in the backend. Configure authentication routes for registration, login, and token refresh.
Configure Google OAuth for user authentication. Handle Google login/signup flows in the backend.
Firebase Configuration:
Configure Firebase for image storage or migrate image storage to the database/cloud storage compatible with Docker.
API Development:
Develop APIs for CRUD operations on products, order management, user profile management, etc.
Integration:
Integrate PayPal for secure payment transactions.
Implement email services for notifications and marketing communications.
Testing and Deployment:
Test the application thoroughly for functionality, security, and performance.
Deploy the application to a hosting provider or a cloud platform.
Usage
Start the development servers with:

bash
Copy code
cd frontend
npm start   # Start frontend server

cd ../backend
You can access the application at http://localhost:3000 for the frontend.
