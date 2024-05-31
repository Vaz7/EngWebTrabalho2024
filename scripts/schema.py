import json
from collections import deque

def validate_json(file_path):
    """
    Validate if the given file contains properly formatted JSON.
    Returns True if valid, False otherwise.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            json_data = json.load(file)
        return True, json_data
    except json.JSONDecodeError as e:
        error_pos = e.pos
        start = max(0, error_pos - 40)
        end = min(len(e.doc), error_pos + 40)
        error_snippet = e.doc[start:end]
        print(f"Error decoding JSON at position {error_pos}: {e.msg}")
        print(f"Context: {error_snippet}")
        return False, None

def extract_unique_fields(json_data):
    unique_fields = set()
    queue = deque([json_data])
    
    while queue:
        current = queue.popleft()
        
        if isinstance(current, dict):
            for key, value in current.items():
                unique_fields.add(key)
                queue.append(value)
        elif isinstance(current, list):
            for item in current:
                queue.append(item)
    
    return unique_fields

def main():
    file_path = '/home/vaz/Desktop/acordao/Acordaos-20230325T095454Z-004/jtca_acordaos.json'
    output_file_path = '/home/vaz/Desktop/unique_fields.txt'
    
    try:
        # Validate the JSON content
        is_valid, json_data = validate_json(file_path)
        
        if not is_valid:
            print("The JSON file is not valid.")
            return
        
        unique_fields = extract_unique_fields(json_data)
        
        # Write unique fields to output file
        with open(output_file_path, 'w', encoding='utf-8') as output_file:
            output_file.write("Unique fields in the JSON file:\n")
            for field in unique_fields:
                output_file.write(f"{field}\n")
                
        print(f"Unique fields have been written to {output_file_path}")
        
    except FileNotFoundError:
        print(f"File not found: {file_path}")

if __name__ == "__main__":
    main()
