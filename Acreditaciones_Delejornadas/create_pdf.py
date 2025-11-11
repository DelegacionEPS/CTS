"""
Script for creating PDF documents from multiple images.

This module combines multiple PNG images into a single PDF document,
with a configurable number of images per page.
"""
import os
import sys
from pathlib import Path
from typing import List, Optional

from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


def get_image_files(input_folder: str) -> List[str]:
    """
    Get sorted list of PNG images from the input folder.
    
    Args:
        input_folder: Path to folder containing images.
        
    Returns:
        List[str]: Sorted list of image filenames.
    """
    image_files = [
        f for f in os.listdir(input_folder)
        if f.lower().endswith('.png') and not f.startswith('.')
    ]
    return sorted(image_files)


def calculate_image_dimensions(
    img_width: float,
    img_height: float,
    box_width: float,
    box_height: float
) -> tuple[float, float, float, float]:
    """
    Calculate scaled dimensions to fit image in box while maintaining aspect ratio.
    
    Args:
        img_width: Original image width.
        img_height: Original image height.
        box_width: Target box width.
        box_height: Target box height.
        
    Returns:
        tuple: (scaled_width, scaled_height, x_offset, y_offset)
    """
    img_aspect = img_width / img_height
    box_aspect = box_width / box_height
    
    if img_aspect > box_aspect:
        # Image is wider than box
        scaled_width = box_width
        scaled_height = box_width / img_aspect
        x_offset = 0
        y_offset = (box_height - scaled_height) / 2
    else:
        # Image is taller than box
        scaled_height = box_height
        scaled_width = box_height * img_aspect
        x_offset = (box_width - scaled_width) / 2
        y_offset = 0
    
    return scaled_width, scaled_height, x_offset, y_offset


def create_pdf_with_images(
    input_folder: str,
    output_pdf: str,
    images_per_page: int = 6
) -> None:
    """
    Create a PDF with multiple images per page in a grid layout.
    
    Args:
        input_folder: Path to the folder containing images.
        output_pdf: Path for the output PDF file.
        images_per_page: Number of images per page (default: 6 for 3x2 grid).
    """
    # Get all PNG images from the folder
    image_files = get_image_files(input_folder)
    
    if not image_files:
        print("No PNG images found in the specified folder.")
        return
    
    print(f"Found {len(image_files)} images")
    
    # Initialize PDF canvas
    pdf_canvas = canvas.Canvas(output_pdf, pagesize=A4)
    page_width, page_height = A4
    
    # Layout configuration for 6 images (3 rows x 2 columns)
    cols = 2
    rows = 3
    margin = 20
    spacing = 10
    
    # Calculate dimensions for each image box
    box_width = (page_width - 2 * margin - spacing) / cols
    box_height = (page_height - 2 * margin - 2 * spacing) / rows
    
    # Process each image
    for idx, img_file in enumerate(image_files):
        # Calculate position on current page
        position = idx % images_per_page
        col = position % cols
        row = position // cols
        
        # Calculate x, y coordinates (PDF coordinates start from bottom-left)
        x = margin + col * (box_width + spacing)
        y = page_height - margin - (row + 1) * box_height - row * spacing
        
        # Load and add image
        img_path = os.path.join(input_folder, img_file)
        try:
            # Open image to get dimensions
            img = Image.open(img_path)
            
            # Calculate scaled dimensions
            scaled_width, scaled_height, x_offset, y_offset = calculate_image_dimensions(
                img.width, img.height, box_width, box_height
            )
            
            # Draw image on PDF
            pdf_canvas.drawImage(
                img_path,
                x + x_offset,
                y + y_offset,
                width=scaled_width,
                height=scaled_height,
                preserveAspectRatio=True
            )
            
            print(f"Added: {img_file} (page {idx // images_per_page + 1})")
            
        except Exception as e:
            print(f"Error processing {img_file}: {e}")
            continue
        
        # Create new page if needed
        if (idx + 1) % images_per_page == 0 and idx + 1 < len(image_files):
            pdf_canvas.showPage()
    
    # Save PDF
    pdf_canvas.save()
    total_pages = (len(image_files) - 1) // images_per_page + 1
    print(f"\nPDF created successfully: {output_pdf}")
    print(f"Total pages: {total_pages}")


def get_paths_from_args() -> tuple[str, str]:
    """
    Get input folder and output PDF paths from command line arguments.
    
    Returns:
        tuple[str, str]: Input folder path and output PDF path.
    """
    if len(sys.argv) < 4:
        print("Usage: python create_pdf.py <base_dir> <output_dir> <output_pdf>")
        print("  base_dir: Base directory (not used, kept for compatibility)")
        print("  output_dir: Directory containing 'cropped' folder with images")
        print("  output_pdf: Path for the output PDF file")
        sys.exit(1)
    
    input_folder = os.path.join(sys.argv[2], "cropped")
    output_pdf = sys.argv[3]
    
    return input_folder, output_pdf


def validate_input_folder(input_folder: str) -> bool:
    """
    Validate that input folder exists.
    
    Args:
        input_folder: Path to the input folder.
        
    Returns:
        bool: True if folder exists, False otherwise.
    """
    if not os.path.exists(input_folder):
        print(f"Error: Folder '{input_folder}' not found.")
        return False
    return True


def main() -> int:
    """
    Main function to create PDF from images.
    
    Returns:
        int: Exit code (0 for success, 1 for failure).
    """
    try:
        # Get paths from command line arguments
        input_folder, output_pdf = get_paths_from_args()
        
        # Validate input folder
        if not validate_input_folder(input_folder):
            return 1
        
        # Create PDF
        print(f"Creating PDF from images in: {input_folder}")
        create_pdf_with_images(input_folder, output_pdf, images_per_page=6)
        
        return 0
        
    except Exception as e:
        print(f"Error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
