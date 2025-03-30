from database_schema import Database, UserRole, LoanStatus, BundleStatus, User, Loan
from datetime import datetime, timedelta
import uuid
import random

def generate_id() -> str:
    return str(uuid.uuid4())

def create_test_borrower(db: Database, name: str, credit_score: int) -> User:
    return db.create_user({
        'id': generate_id(),
        'email': f"{name.lower().replace(' ', '.')}@example.com",
        'role': UserRole.BORROWER,
        'full_name': name,
        'created_at': datetime.now(),
        'credit_score': credit_score
    })

def create_test_loan(db: Database, borrower, amount: float, purpose: str, 
                    interest_rate: float, term_months: int, credit_score: int,
                    monthly_income: float) -> Loan:
    return db.create_loan({
        'id': generate_id(),
        'borrower_id': borrower.id,
        'amount': amount,
        'interest_rate': interest_rate,
        'term_months': term_months,
        'purpose': purpose,
        'status': LoanStatus.APPROVED,
        'created_at': datetime.now() - timedelta(days=random.randint(1, 30)),
        'credit_score': credit_score,
        'monthly_income': monthly_income,
        'debt_to_income_ratio': round(random.uniform(0.2, 0.5), 2),
        'employment_status': random.choice(['Full-time', 'Part-time', 'Self-employed', 'Business Owner'])
    })

def main():
    # Initialize database
    db = Database()
    
    print("Creating test users...")
    
    # Create multiple borrowers with different credit profiles
    borrowers = [
        # High credit score borrowers (720-850)
        create_test_borrower(db, "John Smith", 780),
        create_test_borrower(db, "Sarah Johnson", 750),
        create_test_borrower(db, "Michael Brown", 820),
        create_test_borrower(db, "Emily Davis", 760),
        # Medium credit score borrowers (660-719)
        create_test_borrower(db, "David Wilson", 700),
        create_test_borrower(db, "Lisa Anderson", 680),
        create_test_borrower(db, "James Taylor", 690),
        create_test_borrower(db, "Maria Garcia", 670),
        # Lower credit score borrowers (580-659)
        create_test_borrower(db, "Robert Martinez", 640),
        create_test_borrower(db, "Jennifer Lee", 620),
        create_test_borrower(db, "William Turner", 600),
        create_test_borrower(db, "Emma White", 630)
    ]
    
    for borrower in borrowers:
        print(f"Created borrower: {borrower.full_name} (Credit Score: {borrower.credit_score})")
    
    # Create multiple admins
    admins = []
    for name in ["Alice Admin", "Bob Manager", "Carol Supervisor", "David Director", "Eva Executive"]:
        admin = db.create_user({
            'id': generate_id(),
            'email': f"{name.lower().replace(' ', '.')}@company.com",
            'role': UserRole.ADMIN,
            'full_name': name,
            'created_at': datetime.now(),
            'managed_bundles': []
        })
        admins.append(admin)
        print(f"Created admin: {admin.full_name}")
    
    # Create multiple investors
    investors = []
    for name, email in [
        ("Global Investment Corp", "global@investment.com"),
        ("Tech Ventures Fund", "ventures@techfund.com"),
        ("Private Investor Jane", "jane@investor.com"),
        ("Sustainable Growth Fund", "contact@sustainablegrowth.com"),
        ("Risk Capital Partners", "info@riskcapital.com"),
        ("Conservative Wealth Management", "invest@conservative.com")
    ]:
        investor = db.create_user({
            'id': generate_id(),
            'email': email,
            'role': UserRole.INVESTOR,
            'full_name': name,
            'created_at': datetime.now(),
            'invested_bundles': []
        })
        investors.append(investor)
        print(f"Created investor: {investor.full_name}")
    
    # Create diverse loan portfolio
    print("\nCreating diverse loan portfolio...")
    loans = []
    
    # Home improvement loans
    home_loans = [
        create_test_loan(db, borrowers[0], 25000.0, "Kitchen Renovation", 0.065, 36, 780, 8000.0),
        create_test_loan(db, borrowers[1], 15000.0, "Bathroom Remodel", 0.069, 24, 750, 7500.0),
        create_test_loan(db, borrowers[2], 50000.0, "Home Extension", 0.062, 48, 820, 12000.0),
        create_test_loan(db, borrowers[4], 30000.0, "Roof Replacement", 0.071, 36, 700, 6000.0),
        create_test_loan(db, borrowers[5], 20000.0, "Solar Panel Installation", 0.073, 48, 680, 5500.0)
    ]
    loans.extend(home_loans)
    
    # Business loans
    business_loans = [
        create_test_loan(db, borrowers[2], 75000.0, "Restaurant Equipment", 0.072, 60, 820, 15000.0),
        create_test_loan(db, borrowers[3], 100000.0, "Retail Store Expansion", 0.068, 48, 760, 20000.0),
        create_test_loan(db, borrowers[6], 50000.0, "E-commerce Platform", 0.075, 36, 690, 8000.0),
        create_test_loan(db, borrowers[7], 25000.0, "Food Truck Startup", 0.078, 24, 670, 4500.0),
        create_test_loan(db, borrowers[1], 150000.0, "Manufacturing Equipment", 0.070, 60, 750, 25000.0)
    ]
    loans.extend(business_loans)
    
    # Education loans
    education_loans = [
        create_test_loan(db, borrowers[5], 35000.0, "MBA Program", 0.059, 48, 680, 4500.0),
        create_test_loan(db, borrowers[3], 25000.0, "Technical Certification", 0.061, 36, 760, 7000.0),
        create_test_loan(db, borrowers[8], 20000.0, "Coding Bootcamp", 0.065, 24, 640, 3500.0),
        create_test_loan(db, borrowers[9], 45000.0, "Medical School", 0.063, 60, 620, 3000.0),
        create_test_loan(db, borrowers[4], 30000.0, "Law School", 0.062, 48, 700, 5000.0)
    ]
    loans.extend(education_loans)
    
    # Personal loans
    personal_loans = [
        create_test_loan(db, borrowers[0], 10000.0, "Wedding Expenses", 0.071, 24, 780, 8000.0),
        create_test_loan(db, borrowers[10], 15000.0, "Debt Consolidation", 0.079, 36, 600, 3500.0),
        create_test_loan(db, borrowers[11], 8000.0, "Medical Expenses", 0.076, 24, 630, 4000.0),
        create_test_loan(db, borrowers[7], 12000.0, "Vehicle Purchase", 0.074, 36, 670, 4500.0),
        create_test_loan(db, borrowers[6], 20000.0, "Home Furnishing", 0.072, 24, 690, 6000.0)
    ]
    loans.extend(personal_loans)
    
    for loan in loans:
        print(f"Created loan: ${loan.amount:,.2f} for {loan.purpose} "
              f"(Rate: {loan.interest_rate*100:.1f}%, Term: {loan.term_months} months)")
    
    # Create different types of bundles
    print("\nCreating specialized bundles...")
    
    # Premium Home Improvement Bundle (High Credit Score)
    premium_home_bundle = db.create_bundle({
        'id': generate_id(),
        'name': 'Premium Home Improvement Bundle',
        'description': 'High-quality home improvement loans with excellent credit scores',
        'admin_id': admins[0].id,
        'status': BundleStatus.ACTIVE,
        'created_at': datetime.now(),
        'loan_ids': [loan.id for loan in home_loans if loan.credit_score >= 750],
        'total_value': sum(loan.amount for loan in home_loans if loan.credit_score >= 750),
        'expected_return': 0.065,
        'risk_score': 0.12,
        'min_investment': 25000.0,
        'term_months': 48
    })
    
    # Standard Home Improvement Bundle
    standard_home_bundle = db.create_bundle({
        'id': generate_id(),
        'name': 'Standard Home Improvement Bundle',
        'description': 'Diverse mix of home improvement loans',
        'admin_id': admins[0].id,
        'status': BundleStatus.ACTIVE,
        'created_at': datetime.now(),
        'loan_ids': [loan.id for loan in home_loans if loan.credit_score < 750],
        'total_value': sum(loan.amount for loan in home_loans if loan.credit_score < 750),
        'expected_return': 0.072,
        'risk_score': 0.18,
        'min_investment': 15000.0,
        'term_months': 48
    })
    
    # Enterprise Business Bundle
    enterprise_business_bundle = db.create_bundle({
        'id': generate_id(),
        'name': 'Enterprise Business Growth Bundle',
        'description': 'Large business loans for established companies',
        'admin_id': admins[1].id,
        'status': BundleStatus.ACTIVE,
        'created_at': datetime.now(),
        'loan_ids': [loan.id for loan in business_loans if loan.amount >= 75000],
        'total_value': sum(loan.amount for loan in business_loans if loan.amount >= 75000),
        'expected_return': 0.070,
        'risk_score': 0.20,
        'min_investment': 50000.0,
        'term_months': 60
    })
    
    # Small Business Bundle
    small_business_bundle = db.create_bundle({
        'id': generate_id(),
        'name': 'Small Business Opportunity Bundle',
        'description': 'Supporting small business growth',
        'admin_id': admins[1].id,
        'status': BundleStatus.ACTIVE,
        'created_at': datetime.now(),
        'loan_ids': [loan.id for loan in business_loans if loan.amount < 75000],
        'total_value': sum(loan.amount for loan in business_loans if loan.amount < 75000),
        'expected_return': 0.076,
        'risk_score': 0.25,
        'min_investment': 20000.0,
        'term_months': 36
    })
    
    # Professional Education Bundle
    professional_edu_bundle = db.create_bundle({
        'id': generate_id(),
        'name': 'Professional Education Bundle',
        'description': 'Advanced degree and professional certification loans',
        'admin_id': admins[2].id,
        'status': BundleStatus.ACTIVE,
        'created_at': datetime.now(),
        'loan_ids': [loan.id for loan in education_loans if loan.amount >= 30000],
        'total_value': sum(loan.amount for loan in education_loans if loan.amount >= 30000),
        'expected_return': 0.061,
        'risk_score': 0.15,
        'min_investment': 30000.0,
        'term_months': 60
    })
    
    # Short-term Education Bundle
    short_term_edu_bundle = db.create_bundle({
        'id': generate_id(),
        'name': 'Short-term Education Bundle',
        'description': 'Technical training and certification loans',
        'admin_id': admins[2].id,
        'status': BundleStatus.ACTIVE,
        'created_at': datetime.now(),
        'loan_ids': [loan.id for loan in education_loans if loan.amount < 30000],
        'total_value': sum(loan.amount for loan in education_loans if loan.amount < 30000),
        'expected_return': 0.063,
        'risk_score': 0.18,
        'min_investment': 15000.0,
        'term_months': 36
    })
    
    # High-Credit Personal Bundle
    high_credit_personal_bundle = db.create_bundle({
        'id': generate_id(),
        'name': 'Premium Personal Loan Bundle',
        'description': 'Personal loans with excellent credit profiles',
        'admin_id': admins[3].id,
        'status': BundleStatus.ACTIVE,
        'created_at': datetime.now(),
        'loan_ids': [loan.id for loan in personal_loans if loan.credit_score >= 700],
        'total_value': sum(loan.amount for loan in personal_loans if loan.credit_score >= 700),
        'expected_return': 0.071,
        'risk_score': 0.14,
        'min_investment': 20000.0,
        'term_months': 36
    })
    
    # Mixed Personal Bundle
    mixed_personal_bundle = db.create_bundle({
        'id': generate_id(),
        'name': 'Diversified Personal Bundle',
        'description': 'Mixed personal loans with varying credit profiles',
        'admin_id': admins[3].id,
        'status': BundleStatus.ACTIVE,
        'created_at': datetime.now(),
        'loan_ids': [loan.id for loan in personal_loans if loan.credit_score < 700],
        'total_value': sum(loan.amount for loan in personal_loans if loan.credit_score < 700),
        'expected_return': 0.076,
        'risk_score': 0.22,
        'min_investment': 10000.0,
        'term_months': 36
    })
    
    # Short-Term High-Yield Bundle
    short_term_bundle = db.create_bundle({
        'id': generate_id(),
        'name': 'Short-Term High-Yield Bundle',
        'description': 'Mix of 24-month loans across categories',
        'admin_id': admins[4].id,
        'status': BundleStatus.ACTIVE,
        'created_at': datetime.now(),
        'loan_ids': [loan.id for loan in loans if loan.term_months == 24],
        'total_value': sum(loan.amount for loan in loans if loan.term_months == 24),
        'expected_return': 0.074,
        'risk_score': 0.20,
        'min_investment': 15000.0,
        'term_months': 24
    })
    
    # Long-Term Stable Bundle
    long_term_bundle = db.create_bundle({
        'id': generate_id(),
        'name': 'Long-Term Stable Return Bundle',
        'description': 'Mix of 48-60 month loans across categories',
        'admin_id': admins[4].id,
        'status': BundleStatus.ACTIVE,
        'created_at': datetime.now(),
        'loan_ids': [loan.id for loan in loans if loan.term_months >= 48],
        'total_value': sum(loan.amount for loan in loans if loan.term_months >= 48),
        'expected_return': 0.067,
        'risk_score': 0.16,
        'min_investment': 40000.0,
        'term_months': 60
    })
    
    bundles = [
        premium_home_bundle, standard_home_bundle,
        enterprise_business_bundle, small_business_bundle,
        professional_edu_bundle, short_term_edu_bundle,
        high_credit_personal_bundle, mixed_personal_bundle,
        short_term_bundle, long_term_bundle
    ]
    
    print("\nCreated Bundles Summary:")
    for bundle in bundles:
        print(f"\nBundle: {bundle.name}")
        print(f"Total value: ${bundle.total_value:,.2f}")
        print(f"Expected return: {bundle.expected_return*100:.1f}%")
        print(f"Risk score: {bundle.risk_score*100:.1f}%")
        print(f"Number of loans: {len(bundle.loan_ids)}")
        print(f"Minimum investment: ${bundle.min_investment:,.2f}")
    
    # Simulate diverse investment patterns
    print("\nSimulating investments...")
    
    # Conservative investor focuses on low-risk bundles
    conservative_investor = investors[5]  # Conservative Wealth Management
    for bundle in bundles:
        if bundle.risk_score <= 0.15:  # Only invest in low-risk bundles
            db.invest_in_bundle(conservative_investor.id, bundle.id, bundle.min_investment)
            print(f"{conservative_investor.full_name} invested ${bundle.min_investment:,.2f} in {bundle.name}")
    
    # Risk-taking investor focuses on high-return bundles
    risk_investor = investors[4]  # Risk Capital Partners
    for bundle in bundles:
        if bundle.expected_return >= 0.07:  # Only invest in high-return bundles
            investment_amount = bundle.min_investment * 2  # Invests double the minimum
            db.invest_in_bundle(risk_investor.id, bundle.id, investment_amount)
            print(f"{risk_investor.full_name} invested ${investment_amount:,.2f} in {bundle.name}")
    
    # Sustainable investor focuses on education and business growth
    sustainable_investor = investors[3]  # Sustainable Growth Fund
    for bundle in bundles:
        if "Education" in bundle.name or "Business" in bundle.name:
            db.invest_in_bundle(sustainable_investor.id, bundle.id, bundle.min_investment * 1.5)
            print(f"{sustainable_investor.full_name} invested ${bundle.min_investment*1.5:,.2f} in {bundle.name}")
    
    # Large institutional investor diversifies across all bundles
    institutional_investor = investors[0]  # Global Investment Corp
    for bundle in bundles:
        investment_amount = max(bundle.min_investment * 3, 100000.0)  # Larger investments
        db.invest_in_bundle(institutional_investor.id, bundle.id, investment_amount)
        print(f"{institutional_investor.full_name} invested ${investment_amount:,.2f} in {bundle.name}")
    
    # Print final statistics
    print("\nFinal Database Statistics:")
    print(f"Total Users: {len(db.users)}")
    print(f"Total Loans: {len(db.loans)}")
    print(f"Total Bundles: {len(db.bundles)}")
    print(f"Total Value of All Loans: ${sum(loan.amount for loan in db.loans.values()):,.2f}")
    print(f"Total Value of All Bundles: ${sum(bundle.total_value for bundle in db.bundles.values()):,.2f}")
    
    # Print investment statistics
    print("\nInvestment Statistics:")
    for investor in investors:
        if investor.invested_bundles:
            invested_bundles = [db.bundles[bundle_id] for bundle_id in investor.invested_bundles]
            total_invested = sum(bundle.total_value for bundle in invested_bundles)
            num_bundles = len(invested_bundles)
            print(f"{investor.full_name}:")
            print(f"  Invested in {num_bundles} bundles")
            print(f"  Total investment exposure: ${total_invested:,.2f}")

if __name__ == "__main__":
    main() 