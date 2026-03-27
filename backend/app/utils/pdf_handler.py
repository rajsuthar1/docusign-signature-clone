import fitz  # PyMuPDF
import os

def overlay_signature_on_pdf(input_pdf_path, output_pdf_path, signature_img_path, x_percent, y_percent, page_num=0):
    """
    Permanently embeds a signature image into a PDF.
    x_percent, y_percent: 0-100 values from the frontend.
    """
    # 1. Open the document
    doc = fitz.open(input_pdf_path)
    page = doc[page_num]
    
    # 2. Get Page Dimensions (Points)
    # Important: Frontend % must be mapped to PDF points (usually 72 DPI)
    width = page.rect.width
    height = page.rect.height
    
    # 3. Calculate Absolute Coordinates
    # We use a standard signature box size (e.g., 100x50 points)
    sig_w = 100 
    sig_h = 50
    
    abs_x = (x_percent / 100) * width
    abs_y = (y_percent / 100) * height
    
    # Create the rectangle where the image will sit
    # (x0, y0, x1, y1) -> centered on the point
    rect = fitz.Rect(
        abs_x - (sig_w / 2), 
        abs_y - (sig_h / 2), 
        abs_x + (sig_w / 2), 
        abs_y + (sig_h / 2)
    )
    
    # 4. Insert Image
    try:
        page.insert_image(rect, filename=signature_img_path)
        
        # 5. Save the new version
        doc.save(output_pdf_path)
        doc.close()
        return True
    except Exception as e:
        print(f"PDF Overlay Error: {e}")
        return False