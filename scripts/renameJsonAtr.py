import json
from collections import deque

def rename_keys_recursive(data, old_name, new_name):
    """
    Recursively rename keys in JSON data.
    """
    if isinstance(data, dict):
        for key in list(data.keys()):
            if key == old_name:
                data[new_name] = data.pop(key)
            rename_keys_recursive(data.get(new_name if key == old_name else key), old_name, new_name)
    elif isinstance(data, list):
        for item in data:
            rename_keys_recursive(item, old_name, new_name)

def main():
    # File paths
    input_file  = '/home/vaz/Desktop/acordao/Acordaos-20230325T095454Z-004/jtca_acordaos.json'
    output_file = '/home/vaz/Desktop/acordao/Acordaos-20230325T095454Z-004/jtca_acordaos.json'
    
    # Attribute names to change
    old_name = 'Votação'
    new_name = 'Votacao'

    # Read JSON data from the file
    with open(input_file, 'r', encoding='utf-8') as file:
        data = json.load(file)

    # Rename the specified keys
    rename_keys_recursive(data, old_name, new_name)

    # Write the updated JSON data back to the file
    with open(output_file, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

    print(f"Attribute '{old_name}' has been renamed to '{new_name}' in the JSON file.")

if __name__ == "__main__":
    main()
