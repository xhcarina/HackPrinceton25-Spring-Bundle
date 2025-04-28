# HP25-Bundle for HackPrinceton 2025 Spring

**Decentralized Microlending Platform**  
Capital One Honorable Mention (HackPrinceton 2025)

## Links
- [Devpost Submission](https://devpost.com/software/bundle-dp9ia2)
- [Backup Branch (Frontend/Backend Code)](https://github.com/EricChang9/HP25-Bundle/tree/backup)

## Tech Stack

### Machine Learning & Risk Assessment
- **Python 3.9+**
- **XGBoost** – loan risk scoring
- **SHAP** – explainable AI for model interpretation
- **scikit-learn** – preprocessing and model pipeline

### Backend
- **Firebase (Firestore)** – real-time database for loan bundles
- **Custom Python API** – risk assessment service
- **Blockchain Integration** – tokenized microloan bundles (planned)

### Frontend
- **React Native** – mobile-first cross-platform UI
- **TypeScript** – typed frontend development
- **Firebase Authentication** – secure login system

### Architecture
- Modular services (loan bundling engine, risk scoring API, mobile frontend)
- Real-time updates via Firebase
- OAuth/Django optional for authentication
- Designed for scalability and decentralized finance (DeFi) expansion

## Core Features
- 🔗 **Smart Bundling** – automated aggregation of microloans
- 📊 **AI Risk Assessment** – borrower scoring and bundle optimization
- 📱 **Mobile Access** – React Native app for borrowers and investors
- 🔒 **Secure Transactions** – blockchain-ready architecture

## Running Locally

```bash
# Clone repository
git clone [repository-url]
cd HP25-Bundle

# Loan Bundling Service
cd loan_bundling
pip install -r requirements.txt
python bundle_algo.py

# Risk Assessment API
cd ../RiskModelandAPI
pip install -r requirements.txt
python api_server.py

# Frontend
cd ../FrontEnd
npm install
npm start
