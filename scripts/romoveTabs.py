import json

# List of attributes to keep
attributes_to_keep = [
    "Jurisprudência Internacional",
    "Meio Processual",
    "Indicações Eventuais",
    "Processo",
    "Data do Acordão",
    "Nº Convencional",
    "Descritores",
    "Decisão Texto Integral",
    "Texto Integral",
    "Data da Reclamação",
    "Apenso",
    "Tribunal Recurso",
    "Jurisprudência Nacional",
    "Material",
    "Privacidade",
    "Legislação Estrangeira",
    "Relator",
    "Referências Internacionais",
    "Data",
    "Recurso",
    "Nº Único do Processo",
    "Nº do Documento",
    "Legislação Nacional",
    "Área Temática",
    "Votação",
    "Legislação Comunitária",
    "MORADA",
    "tribunal",
    "Processo",
    "Período",
    "NÍVEL",
    "Doutrina",
    "Jurisprudência Estrangeira",
    "Decisão",
    "Sumário",
    "Data da Decisão Singular"
]

def filter_json(input_json):
    # Filter only the attributes that are in the attributes_to_keep list
    return {key: value for key, value in input_json.items() if key in attributes_to_keep}

# Example usage
if __name__ == "__main__":
    # Load your JSON data
    with open('/home/vaz/Desktop/acordao/Acordaos-20230325T095454Z-004/jtca_acordaos.json', 'r', encoding='utf-8') as file:
        data = json.load(file)

    # Check if the loaded data is a list
    if isinstance(data, list):
        # Filter each item in the list
        filtered_data = [filter_json(item) for item in data]
    else:
        # Filter the single JSON object
        filtered_data = filter_json(data)

    # Save the filtered JSON data
    with open('/home/vaz/Desktop/acordao/Acordaos-20230325T095454Z-004/jtca_acordaos.json', 'w', encoding='utf-8') as file:
        json.dump(filtered_data, file, ensure_ascii=False, indent=4)

    print("Filtered JSON saved to jstj_acordaos_filtered.json")
