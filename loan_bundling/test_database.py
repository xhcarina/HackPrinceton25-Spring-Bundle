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
        'employment_status': random.choice(['Full-time', 'Part-time', 'Self-employed'])
    })

def main():
    # Initialize database
    db = Database()
    
    print("Creating test users...")
    
    # Create multiple borrowers with different credit profiles
    borrowers = [
        create_test_borrower(db, "John Smith", 720),
        create_test_borrower(db, "Sarah Johnson", 680),
        create_test_borrower(db, "Michael Brown", 750),
        create_test_borrower(db, "Emily Davis", 700),
        create_test_borrower(db, "David Wilson", 640)
    ]
    
    for borrower in borrowers:
        print(f"Created borrower: {borrower.full_name} (Credit Score: {borrower.credit_score})")
    
    # Create multiple admins
    admins = []
    for name in ["Alice Admin", "Bob Manager", "Carol Supervisor"]:
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
        ("Private Investor Jane", "jane@investor.com")
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
        create_test_loan(db, borrowers[0], 25000.0, "Kitchen Renovation", 0.065, 36, 720, 6000.0),
        create_test_loan(db, borrowers[1], 15000.0, "Bathroom Remodel", 0.069, 24, 680, 4500.0),
        create_test_loan(db, borrowers[2], 50000.0, "Home Extension", 0.062, 48, 750, 8000.0)
    ]
    loans.extend(home_loans)
    
    # Business loans
    business_loans = [
        create_test_loan(db, borrowers[2], 75000.0, "Restaurant Equipment", 0.072, 60, 750, 12000.0),
        create_test_loan(db, borrowers[3], 30000.0, "Inventory Expansion", 0.068, 36, 700, 7000.0),
        create_test_loan(db, borrowers[4], 20000.0, "Marketing Campaign", 0.075, 24, 640, 5000.0)
    ]
    loans.extend(business_loans)
    
    # Education loans
    education_loans = [
        create_test_loan(db, borrowers[1], 35000.0, "MBA Program", 0.059, 48, 680, 4500.0),
        create_test_loan(db, borrowers[3], 25000.0, "Technical Certification", 0.061, 36, 700, 7000.0)
    ]
    loans.extend(education_loans)
    
    # Personal loans
    personal_loans = [
        create_test_loan(db, borrowers[0], 10000.0, "Wedding Expenses", 0.071, 24, 720, 6000.0),
        create_test_loan(db, borrowers[4], 15000.0, "Debt Consolidation", 0.079, 36, 640, 5000.0)
    ]
    loans.extend(personal_loans)
    
    for loan in loans:
        print(f"Created loan: ${loan.amount:,.2f} for {loan.purpose} "
              f"(Rate: {loan.interest_rate*100:.1f}%, Term: {loan.term_months} months)")
    
    # Create different types of bundles
    print("\nCreating specialized bundles...")
    
    # Home Improvement Bundle
    home_bundle = db.create_bundle({
        'id': generate_id(),
        'name': 'Premium Home Improvement Bundle',
        'description': 'A collection of high-quality home improvement loans',
        'admin_id': admins[0].id,
        'status': BundleStatus.ACTIVE,
        'created_at': datetime.now(),
        'loan_ids': [loan.id for loan in home_loans],
        'total_value': sum(loan.amount for loan in home_loans),
        'expected_return': 0.065,
        'risk_score': 0.15,
        'min_investment': 10000.0,
        'term_months': 48
    })
    
    # Business Growth Bundle
    business_bundle = db.create_bundle({
        'id': generate_id(),
        'name': 'Business Growth Opportunity Bundle',
        'description': 'Diversified portfolio of business expansion loans',
        'admin_id': admins[1].id,
        'status': BundleStatus.ACTIVE,
        'created_at': datetime.now(),
        'loan_ids': [loan.id for loan in business_loans],
        'total_value': sum(loan.amount for loan in business_loans),
        'expected_return': 0.072,
        'risk_score': 0.25,
        'min_investment': 20000.0,
        'term_months': 60
    })
    
    # Mixed Purpose Bundle
    mixed_loans = education_loans + personal_loans
    mixed_bundle = db.create_bundle({
        'id': generate_id(),
        'name': 'Diversified Personal Bundle',
        'description': 'Mixed portfolio of education and personal loans',
        'admin_id': admins[2].id,
        'status': BundleStatus.ACTIVE,
        'created_at': datetime.now(),
        'loan_ids': [loan.id for loan in mixed_loans],
        'total_value': sum(loan.amount for loan in mixed_loans),
        'expected_return': 0.068,
        'risk_score': 0.20,
        'min_investment': 15000.0,
        'term_months': 48
    })
    
    bundles = [home_bundle, business_bundle, mixed_bundle]
    for bundle in bundles:
        print(f"\nCreated bundle: {bundle.name}")
        print(f"Total value: ${bundle.total_value:,.2f}")
        print(f"Expected return: {bundle.expected_return*100:.1f}%")
        print(f"Number of loans: {len(bundle.loan_ids)}")
    
    # Simulate investments
    print("\nSimulating investments...")
    
    # Global Investment Corp invests in home improvement bundle
    db.invest_in_bundle(investors[0].id, home_bundle.id, 50000.0)
    print(f"{investors[0].full_name} invested in {home_bundle.name}")
    
    # Tech Ventures invests in business bundle
    db.invest_in_bundle(investors[1].id, business_bundle.id, 75000.0)
    print(f"{investors[1].full_name} invested in {business_bundle.name}")
    
    # Multiple investors in mixed bundle
    for investor in investors:
        db.invest_in_bundle(investor.id, mixed_bundle.id, 25000.0)
    print(f"All investors invested in {mixed_bundle.name}")
    
    # Print final statistics
    print("\nFinal Database Statistics:")
    print(f"Total Users: {len(db.users)}")
    print(f"Total Loans: {len(db.loans)}")
    print(f"Total Bundles: {len(db.bundles)}")
    print(f"Total Value of All Loans: ${sum(loan.amount for loan in db.loans.values()):,.2f}")
    print(f"Total Value of All Bundles: ${sum(bundle.total_value for bundle in db.bundles.values()):,.2f}")

if __name__ == "__main__":
    main() 