import firebase_admin
from firebase_admin import credentials, db, firestore
from datetime import datetime
from typing import List, Dict, Any
from dataclasses import dataclass

# This will be initialized in your main application
# firebase_admin.initialize_app(cred)

class BundleAlgorithm:
    def __init__(self):
        self.db = firestore.client()
        self.loans_collection = self.db.collection('loans')
        
    def search_available_loans(self) -> List[Dict[str, Any]]:
        """
        Search through the database to find currently available single loans
        Returns a list of available loans
        """
        try:
            # Query the database for available loans
            available_loans = self.loans_collection.where('status', '==', 'available').get()
            
            if not available_loans:
                return []
                
            # Convert to list and add loan IDs
            loans_list = []
            for loan in available_loans:
                loan['id'] = loan.id
                loans_list.append(loan.to_dict())
                
            return loans_list
            
        except Exception as e:
            print(f"Error searching for available loans: {str(e)}")
            return []

    def create_bundle(self, selected_loan_ids: List[str], bundle_params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new bundle from selected loans
        Args:
            selected_loan_ids: List of loan IDs to bundle
            bundle_params: Dictionary containing bundle parameters (name, description, etc.)
        Returns:
            Dictionary containing the created bundle information
        """
        try:
            # Verify all loans exist and are available
            available_loans = self.search_available_loans()
            available_loan_ids = [loan['id'] for loan in available_loans]
            
            if not all(loan_id in available_loan_ids for loan_id in selected_loan_ids):
                raise ValueError("Some selected loans are not available")

            # Calculate bundle metrics
            total_value = sum(
                loan['amount'] 
                for loan in available_loans 
                if loan['id'] in selected_loan_ids
            )
            
            # Create bundle object
            bundle = {
                'loan_ids': selected_loan_ids,
                'name': bundle_params.get('name', 'New Bundle'),
                'description': bundle_params.get('description', ''),
                'status': 'active',
                'total_value': total_value,
                'created_at': datetime.now().isoformat(),
                'number_of_loans': len(selected_loan_ids)
            }
            
            # Save to database (implementation depends on your database structure)
            new_bundle_ref = self.db.collection('bundles').add(bundle)
            
            # Update status of individual loans
            for loan_id in selected_loan_ids:
                self.loans_collection.document(loan_id).update({
                    'status': 'bundled',
                    'bundle_id': new_bundle_ref.id
                })
            
            return {**bundle, 'id': new_bundle_ref.id}
            
        except Exception as e:
            print(f"Error creating bundle: {str(e)}")
            return None 