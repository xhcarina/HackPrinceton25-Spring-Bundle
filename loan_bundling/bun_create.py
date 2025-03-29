import pandas as pd
import firebase_admin
from firebase_admin import credentials, db
from config.firebase_admin_config import get_firebase_config
from dataclasses import dataclass
from datetime import datetime

# Initialize Firebase Admin with your service account key and database URL
cred = credentials.Certificate("path/to/serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://<your-database-name>.firebaseio.com/'
})

@dataclass
class Bundle:
    loan_ids: list[str]
    M: float
    bundle_id: int
    bundle_name: str
    bundle_description: str
    bundle_status: bool
    bundle_value: float
    bundle_created_at: datetime
    bundle_end_date: datetime
    i_rate: float = 0.0

    def __post_init__(self):
        self.i_rate = self.set_bundle_i_rate()
        
    @property
    def i_rate(self):
        """Read-only access to i_rate"""
        return self._i_rate

    def set_bundle_i_rate(self) -> float:
        avg_default_rate = 0
        for loan in self.loan_ids:
            loan_data = db.collection('loans').document(loan).get()
            avg_default_rate += loan_data['default_rate']
        avg_default_rate /= len(self.loan_ids)
        
        return ((1 + self.M) / (1 - avg_default_rate)) - 1


    
    
all_loans = db.collection('loans').get()

def make_loan_bundle(all_loans):
    pass

