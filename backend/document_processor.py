import os
import PyPDF2
import re
from typing import Optional

class DocumentProcessor:
    def __init__(self):
        pass
    
    def extract_text(self, file_path: str) -> str:
        """Extract text from PDF or TXT files"""
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            return self._extract_pdf_text(file_path)
        elif file_extension == '.txt':
            return self._extract_txt_text(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
    
    def _extract_pdf_text(self, file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text += f"\n--- Page {page_num + 1} ---\n{page_text}"
        except Exception as e:
            raise Exception(f"Error reading PDF file: {str(e)}")
        
        return self._clean_text(text)
    
    def _extract_txt_text(self, file_path: str) -> str:
        """Extract text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                text = file.read()
        except UnicodeDecodeError:
            # Try with different encoding
            with open(file_path, 'r', encoding='latin-1') as file:
                text = file.read()
        except Exception as e:
            raise Exception(f"Error reading TXT file: {str(e)}")
        
        return self._clean_text(text)
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)\"\']+', '', text)
        # Remove empty lines
        text = re.sub(r'\n\s*\n', '\n', text)
        
        return text.strip()
    
    def get_text_sections(self, text: str) -> list:
        """Split text into logical sections"""
        # Split by paragraphs (double newlines)
        paragraphs = text.split('\n\n')
        
        # Further split long paragraphs
        sections = []
        for para in paragraphs:
            if len(para) > 1000:  # Split long paragraphs
                sentences = para.split('. ')
                current_section = ""
                for sentence in sentences:
                    if len(current_section + sentence) > 800:
                        if current_section:
                            sections.append(current_section.strip())
                        current_section = sentence
                    else:
                        current_section += sentence + ". "
                if current_section:
                    sections.append(current_section.strip())
            else:
                sections.append(para.strip())
        
        return [s for s in sections if s]
