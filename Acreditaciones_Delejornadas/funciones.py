"""
Functions for generating accreditation badges from Excel data.

This module contains utility functions for reading Excel data and generating
HTML-based accreditation badges.
"""
import os
from pathlib import Path
from typing import Dict, List, Optional

import openpyxl as xl
from html2image import Html2Image
from PIL import Image


# Color mapping for different centers
CENTER_COLORS = {
    "escuela": ("#3BC4A0", "eps"),
    "colme": ("#09725F", "colme"),
    "humanidades": ("#5599DD", "humanidades"),
    "sociales": ("#FFBF1F", "sociales"),
    "postgrado": ("#FF6D2E", "puerta"),
    "salud": ("#ED2939", "salud"),
    "autoridad": ("#171796", "autoridad")
}

# Special center color for sectorial and authority
SECTORIAL_COLOR = "#171796"

# Role templates
ROLE_TEMPLATES = {
    "ORGANIZADOR": """
        <div style="width: 1031px; height: 176px; left: 380px; top: 710px; position: absolute">
        <div style="width: 1031px; height: 176px; left: 0px; top: 0px; position: absolute; background: #171796"></div>
        <div style="width: 835px; height: 94px; left: 98px; top: 41px; position: absolute; text-align: center; color: white; font-size: 70px; font-family: Montserrat; font-weight: 800; word-wrap: break-word">ORGANIZACIÓN</div>
        </div>
    """,
    "PONENTE": """
        <div style="width: 1031px; height: 176px; left: 380px; top: 710px; position: absolute">
        <div style="width: 1031px; height: 176px; left: 0px; top: 0px; position: absolute; background: rgba(0, 20, 137, 0.70)"></div>
        <div style="width: 835px; height: 94px; left: 98px; top: 41px; position: absolute; text-align: center; color: white; font-size: 70px; font-family: Montserrat; font-weight: 800; word-wrap: break-word">PONENTE</div>
        </div>
    """
}

# Team shape templates
TEAM_SHAPES = {
    "AZUL": '<div style="width: 111px; height: 111px; right: 30px; top: 30px; position: absolute; background: #4F4FFF"></div>',
    "VERDE": '<div style="width: 111px; height: 111px; right: 70px; top: 90px; position: absolute; transform: rotate(-44.65deg); transform-origin: 0 0; background: #65CC76"></div>',
    "ROJO": '<div style="width: 111px; height: 111px; right: 30px; top: 30px; position: absolute; background: #FF4B4B; border-radius: 9999px"></div>',
    "AMARILLO": '<div style="width: 0; height: 0;right: 30px; top: 30px; border-left: 50px solid transparent; border-right: 50px solid transparent; border-bottom: 100px solid #FFEB3A; position: absolute;"></div>'
}


def get_center_info(centro: str) -> tuple[str, str]:
    """
    Get color and identifier for a given center.
    
    Args:
        centro: Name of the center.
        
    Returns:
        tuple[str, str]: Color hex code and center identifier.
    """
    centro_lower = centro.lower()
    
    for key, (color, identifier) in CENTER_COLORS.items():
        if key in centro_lower:
            return color, identifier
    
    if centro.upper() in ["SECTORIAL", "AUTORIDAD"]:
        return SECTORIAL_COLOR, centro
    
    return "", centro


def get_role_html(rol: Optional[str]) -> str:
    """
    Get HTML template for a given role.
    
    Args:
        rol: Role identifier (can be None).
        
    Returns:
        str: HTML template for the role or empty string if no special role.
    """
    if not rol:
        return ""
    
    if rol in ROLE_TEMPLATES:
        return ROLE_TEMPLATES[rol]
    
    if rol != "NO":
        return f"""
            <div style="width: 1031px; height: 176px; left: 380px; top: 710px; position: absolute">
            <div style="width: 1031px; height: 176px; left: 0px; top: 0px; position: absolute; background: #171796"></div>
            <div style="width: 835px; height: 94px; left: 98px; top: 41px; position: absolute; text-align: center; color: white; font-size: 70px; font-family: Montserrat; font-weight: 800; word-wrap: break-word">{rol}</div>
            </div>
        """
    
    return ""


def get_team_shape(team: Optional[str]) -> str:
    """
    Get HTML for team shape indicator.
    
    Args:
        team: Team color identifier (can be None).
        
    Returns:
        str: HTML for team shape or "white" if no team.
    """
    if not team:
        return "white"
    return TEAM_SHAPES.get(team, "white")


def prepare_data(data: Dict[str, Optional[str]]) -> Dict[str, Optional[str]]:
    """
    Prepare and format participant data for badge generation.
    
    Args:
        data: Raw participant data dictionary.
        
    Returns:
        Dict[str, Optional[str]]: Formatted data dictionary ready for template.
    """
    # Get center information
    centro = data.get("centro")
    if centro:
        color, centro_id = get_center_info(centro)
        data["color"] = color
        data["centro"] = centro_id
    
    # Handle role
    rol = data.get("rol")
    if rol:
        data["rol"] = get_role_html(rol)
    
    # Handle sectorial special case
    if data.get("centro") == "SECTORIAL" and "degree" in data:
        degree = data.get("degree", "")
        data["degree"] = f"PONENTE JFDE <br/> {degree}"
    
    # Handle team
    team = data.get("team")
    if team:
        data["team"] = get_team_shape(team)
    
    # Set event name
    data["event"] = "XVI JFDE"
    
    return data


def sanitize_filename(name: Optional[str]) -> str:
    """
    Sanitize a string for use in filename.
    
    Args:
        name: Original name string (can be None).
        
    Returns:
        str: Sanitized name safe for filenames.
    """
    if name is None:
        return "unknown"
    sanitized = name.replace(" ", "_")
    return sanitized.rstrip("_")


def gen_acreditacion(data: Dict[str, Optional[str]], f_output: str) -> None:
    """
    Generate an accreditation badge image from participant data.
    
    Args:
        data: Dictionary containing participant information.
        f_output: Output directory path for generated images.
    """
    # Validate input data
    if not data or data.get("centro") is None:
        print("Skipping empty/invalid row:", data)
        return
    
    # Initialize Html2Image with custom browser if specified
    browser_exec = os.environ.get('HTML2IMAGE_BROWSER')
    hti = Html2Image(
        output_path=f_output,
        browser_executable=browser_exec if browser_exec else None
    )
    
    # Load HTML template
    try:
        with open('base.html', 'r', encoding='utf-8') as file:
            html_template = file.read()
    except FileNotFoundError:
        print("Error: base.html template file not found.")
        return
    
    # Prepare data
    processed_data = prepare_data(data.copy())  # Work with a copy to avoid modifying original
    
    # Format HTML with participant data
    html_content = html_template.format(**processed_data)
    
    # Generate filename
    name_sanitized = sanitize_filename(data.get('name'))
    surname_sanitized = sanitize_filename(data.get('surname'))
    file_name = f"acred_{name_sanitized}_{surname_sanitized}.png"
    
    # Replace relative image paths with absolute paths
    base_dir = Path.cwd() / "base"
    centro_value = processed_data.get("centro", "autoridad")
    html_content = html_content.replace(
        'src="base/centro.png"', 
        f'src="{base_dir / f"{centro_value}.png"}"'
    )
    html_content = html_content.replace(
        'src="base/uc3m.png"', 
        f'src="{base_dir / "uc3m.png"}"'
    )
    html_content = html_content.replace(
        'src="base/dele.png"', 
        f'src="{base_dir / "dele.png"}"'
    )
    
    # Generate screenshot
    print(f"Generating {file_name}")
    hti.screenshot(html_str=html_content, save_as=file_name, size=(1411, 950))
    
    # Crop and save image
    crop_and_save_image(f_output, file_name)


def crop_and_save_image(output_dir: str, file_name: str, crop_height: int = 863) -> None:
    """
    Crop generated image and save to cropped directory.
    
    Args:
        output_dir: Output directory path.
        file_name: Name of the image file.
        crop_height: Height to crop the image to (default: 863).
    """
    try:
        img_path = Path(output_dir) / file_name
        img = Image.open(img_path)
        
        # Crop the image, removing from the bottom
        img_cropped = img.crop((0, 0, img.width, crop_height))
        
        # Create cropped directory if it doesn't exist
        cropped_dir = Path(output_dir) / "cropped"
        cropped_dir.mkdir(parents=True, exist_ok=True)
        
        # Save cropped image
        img_cropped.save(cropped_dir / file_name)
        
    except Exception as e:
        print(f"Error cropping image {file_name}: {e}")



def get_excel_data(excel_path: str) -> List[Dict[str, Optional[str]]]:
    """
    Read participant data from Excel file.
    
    Args:
        excel_path: Path to the Excel file.
        
    Returns:
        List[Dict[str, Optional[str]]]: List of participant data dictionaries.
        
    Raises:
        FileNotFoundError: If Excel file doesn't exist.
        Exception: If there's an error reading the Excel file.
    """
    try:
        workbook = xl.load_workbook(excel_path)
        sheet = workbook.active
        
        if sheet is None:
            raise Exception("No active sheet found in workbook")
        
        # Get headers from first row
        headers: List[str] = []
        for col in range(1, 7):  # Assuming 6 columns
            header_value = sheet.cell(row=1, column=col).value
            if header_value and isinstance(header_value, str):
                headers.append(header_value)
        
        if not headers:
            raise Exception("No headers found in Excel file")
        
        # Read data rows
        data: List[Dict[str, Optional[str]]] = []
        for row in sheet.iter_rows(min_row=2):  # Skip header row
            row_data: Dict[str, Optional[str]] = {}
            for idx, cell in enumerate(row[:len(headers)]):
                header_key = headers[idx]
                row_data[header_key] = str(cell.value) if cell.value is not None else None
            
            # Only add non-empty rows
            if any(row_data.values()):
                data.append(row_data)
        
        return data
        
    except FileNotFoundError:
        raise FileNotFoundError(f"Excel file not found: {excel_path}")
    except Exception as e:
        raise Exception(f"Error reading Excel file: {e}")
