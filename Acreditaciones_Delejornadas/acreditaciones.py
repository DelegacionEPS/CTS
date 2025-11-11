"""
Script for generating accreditation badges from Excel data.

This module reads participant data from an Excel file and generates
individual accreditation badges as PNG images.
"""
import sys
from pathlib import Path
from typing import Optional

from funciones import gen_acreditacion, get_excel_data
from concurrent.futures import ProcessPoolExecutor, as_completed


def get_file_paths() -> tuple[str, str]:
    """
    Get input and output file paths from command line arguments or user input.
    
    Returns:
        tuple[str, str]: Input file path and output directory path.
    """
    if len(sys.argv) >= 3:
        return sys.argv[1], sys.argv[2]
    
    input_file = input("Introduce excel file path: ")
    output_file = input("Introduce output file path: ")
    return input_file, output_file


def validate_paths(input_file: str, output_dir: str) -> bool:
    """
    Validate that input file exists and output directory is valid.
    
    Args:
        input_file: Path to the Excel input file.
        output_dir: Path to the output directory.
        
    Returns:
        bool: True if paths are valid, False otherwise.
    """
    input_path = Path(input_file)
    if not input_path.exists():
        print(f"Error: Input file '{input_file}' does not exist.")
        return False
    
    if not input_path.suffix in ['.xlsx', '.xls']:
        print(f"Warning: Input file '{input_file}' may not be a valid Excel file.")
    
    # Create output directory if it doesn't exist
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    return True


def main() -> int:
    """
    Main function to generate accreditation badges.
    
    Returns:
        int: Exit code (0 for success, 1 for failure).
    """
    try:
        input_file, output_dir = get_file_paths()
        
        if not validate_paths(input_file, output_dir):
            return 1
        
        print(f"Reading data from: {input_file}")
        data = get_excel_data(input_file)
        
        if not data:
            print("No data found in the Excel file.")
            return 1
        
        print(f"Generating {len(data)} accreditation badges...")
        futures = {}
        with ProcessPoolExecutor() as executor:
            for idx, participant_data in enumerate(data, 1):
                futures[executor.submit(gen_acreditacion, participant_data, output_dir)] = idx

            completed = 0
            for fut in as_completed(futures):
                idx = futures[fut]
                try:
                    fut.result()
                    completed += 1
                    print(f"Processed {completed}/{len(data)} (item {idx})")
                except Exception as e:
                    print(f"Error processing item {idx}: {e}")
        
        print(f"\nSuccessfully generated {len(data)} badges in: {output_dir}")
        return 0
        
    except Exception as e:
        print(f"Error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
