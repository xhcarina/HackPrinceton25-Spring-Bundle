import json
import os

# Path is relative to the root of the project
FIREBASE_CONFIG_PATH = os.path.join('FrontEnd', 'config', 'firebase-config.ts')

def get_firebase_config():
    # Read the TypeScript file
    with open(FIREBASE_CONFIG_PATH, 'r') as f:
        content = f.read()
        
    # Extract the config object (basic parsing)
    config_start = content.find('{')
    config_end = content.rfind('}') + 1
    config_str = content[config_start:config_end]
    
    # Convert to Python dictionary
    # Remove TypeScript export const and convert to valid JSON
    config_str = config_str.replace('export const firebaseConfig = ', '')
    config_dict = json.loads(config_str)
    
    return config_dict 