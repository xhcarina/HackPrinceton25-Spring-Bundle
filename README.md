# Everything is on the backup branch check: https://github.com/EricChang9/HP25-Bundle/tree/backup
# HP25-Bundle: Decentralized Microlending Platform

A revolutionary microlending platform that combines intelligent loan bundling, advanced risk assessment, and a modern mobile interface for efficient microloan management.

## Vision & Overview

HP25-Bundle revolutionizes microlending by:
- Creating an efficient marketplace for small loans
- Enabling intelligent loan bundling for improved management
- Providing sophisticated risk assessment and resource allocation
- Empowering borrowers in developing economies while offering investors new opportunities
- Maintaining transparency while ensuring benefits flow to underserved communities

## Inspiration
Our project was inspired by the critical gap in microfinance: while millions of people need small loans for business and personal development, traditional financial systems often fail to serve them efficiently. We drew inspiration from:
- The success of platforms like Kiva in connecting lenders with borrowers
- The potential of blockchain technology to revolutionize financial inclusion
- The need for more liquid and efficient microfinance markets
- The desire to make microfinance investments more accessible to regular investors

## What it does
HP25-Bundle transforms microfinance by:
1. **Smart Bundling**: Aggregates individual loans into managed investment bundles using Firebase
2. **Risk Assessment**: Uses advanced XGBoost and SHAP analysis for loan evaluation
3. **Mobile Access**: Provides React Native mobile interface for borrowers and investors
4. **Market Creation**: Provides a secure platform where:
   - Borrowers can access affordable loans
   - Investors can manage microloan bundles
   - Risk is assessed through AI-driven analysis
   - Returns are tracked through Firebase integration

## How we built it
Our platform combines several modern technologies:
1. **Risk Assessment Engine**:
   - XGBoost regression model for credit scoring
   - SHAP values for transparent risk explanation
   - Advanced preprocessing pipeline with sklearn
   - Automated model retraining capabilities

2. **Bundling System**:
   - Firebase-based loan management
   - Real-time bundle tracking
   - Firestore database integration
   - Automated status updates

3. **Mobile Frontend**:
   - React Native for cross-platform support
   - Firebase real-time updates
   - TypeScript implementation
   - Component-based architecture

## Challenges we ran into
1. **Risk Assessment Complexity**:
   - Training data preprocessing challenges
   - Model interpretability requirements
   - Feature importance analysis
   - Cross-validation implementation

2. **Firebase Integration**:
   - Real-time data synchronization
   - Security rule configuration
   - Bundle status management
   - Transaction handling

3. **Mobile Development**:
   - Cross-platform compatibility
   - TypeScript integration
   - State management
   - Performance optimization

4. **System Integration**:
   - API endpoint coordination
   - Data flow management
   - Error handling
   - Testing implementation

## Accomplishments that we're proud of
1. **Technical Achievements**:
   - Developed a sophisticated risk assessment model with 85%+ accuracy
   - Created an efficient loan bundling algorithm
   - Built a scalable, secure platform architecture

2. **Innovation**:
   - Successfully combined traditional microfinance with blockchain technology
   - Created a new class of tradeable microfinance securities
   - Developed transparent risk assessment mechanisms

3. **Social Impact**:
   - Designed a system that benefits both borrowers and investors
   - Created potential for greater financial inclusion
   - Built a platform that can scale to serve millions

## What we learned
1. **Technical Insights**:
   - Advanced machine learning model deployment
   - Blockchain integration challenges
   - Scalable system architecture design

2. **Domain Knowledge**:
   - Microfinance market dynamics
   - Risk assessment methodologies
   - Regulatory requirements in fintech

3. **Project Management**:
   - Cross-functional team coordination
   - Agile development in fintech
   - Balancing technical and business requirements

## What's next for Bundle
1. **Platform Expansion**:
   - Integration with more microfinance institutions
   - Support for additional currencies and regions
   - Enhanced mobile accessibility

2. **Technical Enhancements**:
   - Advanced risk model iterations
   - Improved bundling algorithms
   - Enhanced blockchain features

3. **Market Development**:
   - Partnership with traditional financial institutions
   - Regulatory approval in key markets
   - Expansion of investor base

4. **Impact Scaling**:
   - Increased focus on underserved regions
   - Development of impact metrics
   - Creation of specialized impact-focused bundles

## Core Features

### For Borrowers
- Secure loan application submission
- Transparent risk assessment and interest rates
- Real-time application status tracking
- Flexible payment schedules

### For Investors
- Access to tokenized microloan bundles
- Diversified investment opportunities
- Real-time portfolio management
- Blockchain-based security trading

## Project Components

### 1. Loan Bundling System (`/loan_bundling`)
- Firebase-based loan management
- Real-time bundle creation and tracking
- Firestore database integration
- Bundle status management
- Automated loan status updates

### 2. Risk Assessment Engine (`/RiskModelandAPI`)
#### Risk Scoring Parameters
- Essential Parameters (e.g., funded_amount, sector, location)
- Recommended Parameters (e.g., borrower demographics, payment history)
- Optional Parameters (e.g., geographical data, exchange rates)
- Bundle-specific Parameters (for aggregated risk assessment)

#### Risk Score System
The risk assessment model uses an advanced XGBoost regressor that outputs scores on a 0-100 scale:

##### Risk Score Interpretation
- 90-100: Excellent (Very Low Risk)
  - Historical pattern of full repayment
  - Strongest creditworthiness indicators
  - Ideal for bundling as anchor loans

- 75-89: Good (Low Risk)
  - Strong repayment probability
  - Favorable risk indicators
  - Reliable bundle components

- 60-74: Moderate (Average Risk)
  - Acceptable repayment probability
  - Some risk factors present
  - Suitable for diversified bundles

- 40-59: Caution (High Risk)
  - Elevated default probability
  - Multiple risk factors
  - Requires risk mitigation strategies

- 0-39: High Caution (Very High Risk)
  - Significant default probability
  - Major risk factors present
  - Not recommended for standard bundles

##### Score Calculation Factors
- Sector performance history
- Geographic risk assessment
- Loan amount evaluation
- Currency stability factors
- Local vs. Global amount ratios
- Historical repayment data

##### Model Features
- Advanced preprocessing pipeline
- Two-stage hyperparameter tuning
- SHAP-based feature importance
- Continuous model calibration
- Automated risk factor analysis

### 3. Frontend Platform (`/FrontEnd`)
#### User Interfaces
- Authentication (OAuth/Django)
- Borrower Dashboard
  - Loan application submission
  - Application status tracking
  - Payment management
- Investor Dashboard
  - Bundle browsing and filtering
  - Investment portfolio management
  - Transaction history

## Technical Architecture

### Prerequisites
- Python 3.9+
- Node.js 16+
- Firebase account and credentials
- Blockchain wallet integration
- Required packages (see respective requirement files)

### Installation

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

3. Set up the Risk Assessment API:
```bash
cd ../RiskModelandAPI
pip install -r requirements.txt
```

4. Set up the Frontend:
```bash
cd ../FrontEnd
npm install
```

5. Configure Firebase and Blockchain:
- Set up Firebase credentials
- Configure blockchain network settings
- Update environment variables

### Running the Platform

1. Start the Loan Bundling Service:
```bash
cd loan_bundling
python bundle_algo.py
```

2. Launch the Risk Assessment API:
```bash
cd RiskModelandAPI
python api_server.py
```

3. Start the Frontend:
```bash
cd FrontEnd
npm start
```

## Development & Testing

### Testing Components
- Loan Bundling: `python test_bundle.py`
- Risk Assessment: `python test_risk_model.py`
- Frontend: `npm test`

### Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Security Considerations
- Encrypted data transmission
- Secure blockchain integration
- Firebase security rules
- API authentication
- User data protection

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact & Support

For technical support or business inquiries, please contact the project maintainers.

## Acknowledgments
- Duke University for the Kiva loan dataset
- Google for Firebase and AI services
- Open-source community contributors 
