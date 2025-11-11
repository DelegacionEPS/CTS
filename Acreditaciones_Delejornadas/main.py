"""
Main entry point for the accreditation badge generation system.

This script orchestrates the two-step process:
1. Generate individual accreditation badges from Excel data
2. Compile the badges into a single PDF document
"""
import sys

from acreditaciones import main as acreditaciones_main
from create_pdf import main as create_pdf_main


def main() -> int:
    """
    Execute the complete accreditation badge generation workflow.
    
    Returns:
        int: Exit code (0 for success, non-zero for failure).
    """
    print("=" * 60)
    print("ACCREDITATION BADGE GENERATION SYSTEM")
    print("=" * 60)
    
    # Step 1: Generate individual badges
    print("\nStep 1: Generating individual badges...")
    print("-" * 60)
    exit_code = acreditaciones_main()
    
    if exit_code != 0:
        print("\nError: Badge generation failed.")
        return exit_code
    
    # Step 2: Create PDF with all badges
    print("\n" + "=" * 60)
    print("Step 2: Creating PDF document...")
    print("-" * 60)
    exit_code = create_pdf_main()
    
    if exit_code != 0:
        print("\nError: PDF creation failed.")
        return exit_code
    
    print("\n" + "=" * 60)
    print("SUCCESS: All badges generated and PDF created!")
    print("=" * 60)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
