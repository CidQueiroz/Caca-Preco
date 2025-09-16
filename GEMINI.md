# Caça-Preço – Marketplace with Intelligent Competitor Monitoring

## Overview

Caça-Preço is a multi-platform marketplace that connects customers and sellers, focusing on price search and comparison, with JWT authentication and role-based access control (Customer, Seller, Administrator).

In addition to traditional marketplace functionalities, Caça-Preço offers an integrated SaaS module for price monitoring and market analysis, exclusive to sellers. This allows sellers to track competitors, adjust strategies, and boost sales, all in one place.

## Key Features

### For Customers
*   Registration/Login with specific permissions.
*   Price Search and Comparison: Create shopping lists, find the lowest price per item, and compare across establishments.
*   Optimized Suggestions: The system suggests the best combination of stores for the lowest total cost, with an option to consolidate purchases.
*   Intelligent Suggestions: AI suggests nearby establishments (Google Maps, categorization), even if they are not registered.

### For Sellers
*   Product Management: Register, list, and manage products and stores.
*   Sales Dashboard: Track performance and reviews.
*   Competitor Monitoring (Integrated SaaS):
    *   Register competitor product links.
    *   Automatic collection of competitor prices and stock at defined intervals.
    *   Data visualization in interactive dashboards, with analysis, alerts, and price history.
    *   Insights for price adjustments and sales strategies.

## Architecture and Technologies

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | **Python, Django, Django Rest Framework** | Central RESTful API that manages all business logic, including users, products, offers, authentication (JWT), and the SaaS module. |
| **Frontend Web** | **React, React Router, Axios** | Single Page Application (SPA) for customers, sellers, and administrators to interact with the platform. |
| **Frontend Mobile** | **React Native, Expo, React Navigation, Context API** | Mobile application for Android and iOS, offering a native experience for customers on the go. |

| **SaaS Automation** | **Python (Selenium, BeautifulSoup, Scrapy)** for competitor data collection. |
| **Data Analysis** | **Pandas, Power BI, Machine Learning** for predictive analysis and dashboards. |
| **Database** | **SQL** for the marketplace and monitored price history. |


| **Monetization**
| **Marketplace** Free for customers; sellers can have free and paid plans.
SaaS Integrated: Subscription plans for sellers, based on:

    * Number of monitored URLs.
    * Collection frequency.
    * Access to historical data and advanced analysis.

**Suggestions for Improving the Physical Model**

**1. Optimization of Price Search and Comparison**
    Composite Indexes: In OFERTA_PRODUTO to speed up searches for the lowest price.
    Materialized Views: Pre-calculated tables for optimized shopping suggestions.

**2. Real-Time Stock**
    Triggers: Automatically update stock after sales.
    Message Queues: For high concurrency, use queues (RabbitMQ, Kafka) for asynchronous updates.

**3. Market and Competitor Analysis**
    Price History: Table to track the evolution of competitor prices.
    Partitioning: Better performance on large volumes of historical data.

**4. Geolocation and AI**
    Latitude/Longitude: Mandatory fields in ENDERECO.
    Geospatial Indexes: For fast proximity searches.
    
**5. Complex Product Variations**
    Flexible Model: ATRIBUTO, VALOR_ATRIBUTO, and PRODUTO_ATRIBUTO_VALOR tables for multiple combinations (e.g., Size, Color, Material).
    Applicability: Flexible catalog and advanced filters for customers.

**Summary:**
    Caça-Preço integrates a marketplace and a competitor monitoring SaaS, offering a complete solution for customers and sellers, with potential for growth, monetization, and differentiation in the market.

## Project Structure

The repository is organized into distinct directories for each application component.

```
/
├── busca-app/
│   ├── backend/              # Main API (Python/Django)
│   ├── frontend/             # Web Application (React)
│   └── mobile/               # Mobile Application (React Native)
└── docs/                 # Detailed project documentation
```

## Configuration and Installation

### 1. Backend (Django)
    The API will be available at `http://localhost:8000`.

### 2. Frontend Web (React)
    The web application will open at `http://localhost:3001`.

### 3. Frontend Mobile (React Native)
    "extra": {
      "apiUrl": "http://192.168.0.101:8000"
    }

## Development and Conventions

*   **Tests:** The `README.md` does not specify a testing framework or commands for running tests.
*   **Code Style:** There is no explicit mention of linters or code formatters in the `README.md`.

## Additional Documentation

For a more in-depth view of the architecture, API endpoints, and database schema, consult the `/docs` folder.

*   **[API Reference (`docs/backend/api-referencia.md`)]**
*   **[Database Schema (`docs/backend/database.md`)]**
*   **[Authentication (`docs/backend/authentication.md`)]**



THIS FOLDER IS TO DEVELOP THE SAAS MODULE: CONFIGURE SCRAPY AND/OR PLAYWRIGHT TO DO WEBSCRAPING