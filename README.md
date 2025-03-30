# HP25-Bundle

A comprehensive microfinance solution that combines loan bundling algorithms, risk assessment models, and a modern frontend interface for efficient microloan management.

## Project Overview

HP25-Bundle is a sophisticated platform designed to revolutionize microfinance operations by:
- Automating loan bundling processes
- Providing accurate risk assessment through machine learning models
- Offering an intuitive user interface for loan management

## Project Structure

The project consists of three main components:

### 1. Loan Bundling (`/loan_bundling`)
- Implements intelligent loan bundling algorithms
- Handles database operations and schema management
- Includes configuration settings and test suites
- Firebase integration for real-time data management

### 2. Risk Model and API (`/RiskModelandAPI`)
- Machine learning models for risk assessment
- Credit prediction algorithms
- Feature importance analysis
- Includes both simple and advanced prediction models
- Data processing and model training utilities

### 3. Frontend (`/FrontEnd`)
- Modern TypeScript-based user interface
- Component-based architecture
- Cross-platform support (Web/Mobile)
- Responsive and intuitive design

## Prerequisites

- Python 3.8+
- Node.js 16+
- Firebase account and credentials
- Required Python packages (see `loan_bundling/requirements.txt`)
- Required Node.js packages (see `FrontEnd/package.json`)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd HP25-Bundle
```

2. Set up the Loan Bundling component:
```bash
cd loan_bundling
pip install -r requirements.txt
```

3. Set up the Frontend:
```bash
cd ../FrontEnd
npm install
```

4. Configure Firebase:
- Place your Firebase credentials in the appropriate configuration files
- Update the Firebase configuration in both backend and frontend components

## Usage

### Loan Bundling
```bash
cd loan_bundling
python bundle_algo.py
```

### Risk Model
```bash
cd RiskModelandAPI
python credit_pred.py
```

### Frontend
```bash
cd FrontEnd
npm start
```

## Testing

Each component includes its own test suite:

- Loan Bundling: `python test_bundle.py` and `python test_database.py`
- Risk Model: Included in respective Python files
- Frontend: `npm test`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any queries or support, please reach out to the project maintainers. 