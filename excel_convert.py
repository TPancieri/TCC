import pandas as pd
import os

# File paths
excel_path = rf"C:\Users\thiag\Downloads\Alagamentos_Goiânia_2020_2024.xlsx"
csv_path = rf"C:\Users\thiag\OneDrive\Área de Trabalho\TCC\ocorrencias_bombeiros_limpo.csv"

# Column mapping
col_mapping = {
    'N° DA OCORRÊNCIA': 'numero_ocorrencia',
    'DATA': 'data_ocorrencia',
    'ANO': 'ano',
    'MUNICIPIO': 'municipio',
    'SEMANA': 'dia_semana',
    'BAIRRO': 'bairro',
    'ESTADO': 'estado',
    'ENDEREÇO': 'endereco',
    'TIPO_ENDERECO': 'tipo_endereco',
    'RISP': 'risp',
    'LOCAL_ESPECIFICO': 'local_especifico',
    'GRUPO': 'grupo',
    'SUBGRUPO': 'subgrupo',
    'NATUREZA': 'natureza',
    'FAIXA_ETARIA': 'faixa_etaria',
    'SEXO': 'sexo'
}

try:
    # Load Excel
    df = pd.read_excel(excel_path)

    # Check for missing columns
    missing = [col for col in col_mapping if col not in df.columns]
    if missing:
        raise ValueError(f"Missing columns in Excel file: {missing}")

    # Rename columns
    df = df.rename(columns=col_mapping)

    # Keep only mapped columns
    df = df[list(col_mapping.values())]

    # Ensure directory exists
    os.makedirs(os.path.dirname(csv_path), exist_ok=True)

    # Export to CSV
    df.to_csv(csv_path, index=False)
    print("CSV exportado com sucesso!")

except Exception as e:
    print(f"Erro ao processar o arquivo: {e}")
