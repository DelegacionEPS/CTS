import os
import sys

from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

def create_pdf_with_images(input_folder, output_pdf, images_per_page=6):
    """
    Creates a PDF with multiple images per page.
    
    Args:
        input_folder: Path to the folder containing images
        output_pdf: Path for the output PDF file
        images_per_page: Number of images per page (default: 6)
    """
    # Get all PNG images from the folder
    image_files = [f for f in os.listdir(input_folder) 
                   if f.lower().endswith('.png') and not f.startswith('.')]
    image_files.sort()
    
    if not image_files:
        print("No PNG images found in the specified folder.")
        return
    
    print(f"Found {len(image_files)} images")
    
    # Create PDF
    c = canvas.Canvas(output_pdf, pagesize=A4)
    page_width, page_height = A4
    
    # Calculate layout for 6 images (3 rows x 2 columns)
    cols = 2
    rows = 3
    margin = 20
    spacing = 10
    
    # Calculate image dimensions to fit on page
    img_width = (page_width - 2 * margin - spacing) / cols
    img_height = (page_height - 2 * margin - 2 * spacing) / rows
    
    # Process images
    for idx, img_file in enumerate(image_files):
        # Calculate position on page
        position = idx % images_per_page
        col = position % cols
        row = position // cols
        
        # Calculate x, y coordinates (PDF coordinates start from bottom-left)
        x = margin + col * (img_width + spacing)
        y = page_height - margin - (row + 1) * img_height - row * spacing
        
        # Load and add image
        img_path = os.path.join(input_folder, img_file)
        try:
            # Open image to get dimensions
            img = Image.open(img_path)
            img_aspect = img.width / img.height
            
            # Calculate scaled dimensions to fit in the box while maintaining aspect ratio
            box_aspect = img_width / img_height
            
            if img_aspect > box_aspect:
                # Image is wider than box
                scaled_width = img_width
                scaled_height = img_width / img_aspect
                y_offset = (img_height - scaled_height) / 2
                c.drawImage(img_path, x, y + y_offset, 
                          width=scaled_width, height=scaled_height, 
                          preserveAspectRatio=True)
            else:
                # Image is taller than box
                scaled_height = img_height
                scaled_width = img_height * img_aspect
                x_offset = (img_width - scaled_width) / 2
                c.drawImage(img_path, x + x_offset, y, 
                          width=scaled_width, height=scaled_height, 
                          preserveAspectRatio=True)
            
            print(f"Added: {img_file} (page {idx // images_per_page + 1})")
            
        except Exception as e:
            print(f"Error processing {img_file}: {e}")
            continue
        
        # Create new page if needed
        if (idx + 1) % images_per_page == 0 and idx + 1 < len(image_files):
            c.showPage()
    
    # Save PDF
    c.save()
    print(f"\nPDF created successfully: {output_pdf}")
    print(f"Total pages: {(len(image_files) - 1) // images_per_page + 1}")


def main():
    # Define paths
    input_folder = os.path.join(sys.argv[2], "cropped")
    output_pdf = sys.argv[3]
    
    # Check if input folder exists
    if not os.path.exists(input_folder):
        print(f"Error: Folder '{input_folder}' not found.")
        return
    
    # Create PDF
    create_pdf_with_images(input_folder, output_pdf, images_per_page=6)


if __name__ == "__main__":
    main()
