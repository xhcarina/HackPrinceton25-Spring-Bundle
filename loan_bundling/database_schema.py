from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum

class UserRole(Enum):
    BORROWER = "borrower"
    ADMIN = "admin"
    INVESTOR = "investor"

class LoanStatus(Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    BUNDLED = "bundled"
    FUNDED = "funded"
    COMPLETED = "completed"
    DEFAULT = "default"

class BundleStatus(Enum):
    ACTIVE = "active"
    FUNDED = "funded"
    COMPLETED = "completed"
    CLOSED = "closed"

@dataclass
class User:
    id: str
    email: str
    role: UserRole
    full_name: str
    created_at: datetime
    # Additional fields based on role
    credit_score: Optional[float] = None  # For borrowers
    managed_bundles: Optional[List[str]] = None  # For admins
    invested_bundles: Optional[List[str]] = None  # For investors

@dataclass
class Loan:
    id: str
    borrower_id: str
    amount: float
    interest_rate: float
    term_months: int
    purpose: str
    status: LoanStatus
    created_at: datetime
    credit_score: float
    monthly_income: float
    debt_to_income_ratio: float
    employment_status: str
    bundle_id: Optional[str] = None
    approved_at: Optional[datetime] = None
    funded_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

@dataclass
class Bundle:
    id: str
    name: str
    description: str
    admin_id: str
    status: BundleStatus
    created_at: datetime
    loan_ids: List[str]
    total_value: float
    expected_return: float
    risk_score: float
    min_investment: float
    term_months: int  # Based on the loans within
    investor_ids: Optional[List[str]] = None
    funded_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

# Database Operations Class
class Database:
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.loans: Dict[str, Loan] = {}
        self.bundles: Dict[str, Bundle] = {}
        
    def create_user(self, user_data: Dict[str, Any]) -> User:
        """Create a new user in the database"""
        user = User(**user_data)
        self.users[user.id] = user
        return user
    
    def create_loan(self, loan_data: Dict[str, Any]) -> Loan:
        """Create a new loan request"""
        loan = Loan(**loan_data)
        self.loans[loan.id] = loan
        return loan
    
    def get_available_loans(self) -> List[Loan]:
        """Get all approved loans that haven't been bundled yet"""
        return [
            loan for loan in self.loans.values()
            if loan.status == LoanStatus.APPROVED and loan.bundle_id is None
        ]
    
    def create_bundle(self, bundle_data: Dict[str, Any]) -> Bundle:
        """Create a new bundle from selected loans"""
        # Validate that all loans exist and are available
        for loan_id in bundle_data['loan_ids']:
            loan = self.loans.get(loan_id)
            if not loan or loan.status != LoanStatus.APPROVED or loan.bundle_id:
                raise ValueError(f"Loan {loan_id} is not available for bundling")
        
        # Create the bundle
        bundle = Bundle(**bundle_data)
        self.bundles[bundle.id] = bundle
        
        # Update loan statuses
        for loan_id in bundle.loan_ids:
            loan = self.loans[loan_id]
            loan.status = LoanStatus.BUNDLED
            loan.bundle_id = bundle.id
        
        return bundle
    
    def get_investor_bundles(self, investor_id: str) -> List[Bundle]:
        """Get all active bundles available for investment"""
        return [
            bundle for bundle in self.bundles.values()
            if bundle.status == BundleStatus.ACTIVE
        ]
    
    def invest_in_bundle(self, investor_id: str, bundle_id: str, amount: float) -> bool:
        """Process an investment in a bundle"""
        bundle = self.bundles.get(bundle_id)
        if not bundle or bundle.status != BundleStatus.ACTIVE:
            return False
            
        # Add investor to bundle
        if not bundle.investor_ids:
            bundle.investor_ids = []
        bundle.investor_ids.append(investor_id)
        
        # Update user's invested bundles
        investor = self.users[investor_id]
        if not investor.invested_bundles:
            investor.invested_bundles = []
        investor.invested_bundles.append(bundle_id)
        
        return True 