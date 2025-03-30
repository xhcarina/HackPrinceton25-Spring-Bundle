import firebase_admin
from firebase_admin import credentials
from bundle_algo import BundleAlgorithm

def main():
    # Initialize Firebase with the service account key
    cred = credentials.Certificate("hp25-51ec9-89992-firebase-adminsdk-fbsvc-5082e791e7.json")
    firebase_admin.initialize_app(cred)
    
    # Create an instance of BundleAlgorithm
    bundle_algo = BundleAlgorithm()
    
    # Test searching for available loans
    print("Searching for available loans...")
    available_loans = bundle_algo.search_available_loans()
    print(f"Found {len(available_loans)} available loans:")
    for loan in available_loans:
        print(f"Loan ID: {loan['id']}, Amount: {loan.get('amount', 'N/A')}")
    
    # If we have available loans, test creating a bundle
    if available_loans:
        print("\nTesting bundle creation...")
        # Take the first two loans as a test
        test_loan_ids = [loan['id'] for loan in available_loans[:2]]
        bundle_params = {
            'name': 'Test Bundle',
            'description': 'A test bundle created by the script'
        }
        
        result = bundle_algo.create_bundle(test_loan_ids, bundle_params)
        if result:
            print("Successfully created bundle:")
            print(f"Bundle ID: {result['id']}")
            print(f"Total Value: {result['total_value']}")
            print(f"Number of Loans: {result['number_of_loans']}")
        else:
            print("Failed to create bundle")
    else:
        print("No available loans to create a bundle")

if __name__ == "__main__":
    main() 