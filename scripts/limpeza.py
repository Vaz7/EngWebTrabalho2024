import json

def remove_keys_recursive(json_data, keys_to_remove):
    """
    Recursively remove specified keys from the JSON data.
    """
    if isinstance(json_data, dict):
        for key in list(json_data.keys()):
            if key in keys_to_remove:
                del json_data[key]
            else:
                remove_keys_recursive(json_data[key], keys_to_remove)
    elif isinstance(json_data, list):
        for item in json_data:
            remove_keys_recursive(item, keys_to_remove)

def main():
    # File paths
    input_file  = '/home/vaz/Desktop/acordao/Acordaos-20230325T095454Z-004/jtca_acordaos.json'
    output_file = '/home/vaz/Desktop/acordao/Acordaos-20230325T095454Z-004/jtca_acordaos.json'
    
    # Keys to remove
    keys_to_remove = [
        "Data"
    ]

    # Read JSON data from the file
    with open(input_file, 'r', encoding='utf-8') as file:
        data = json.load(file)

    # Remove the specified keys
    remove_keys_recursive(data, keys_to_remove)

    # Write the updated JSON data back to the file
    with open(output_file, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    main()