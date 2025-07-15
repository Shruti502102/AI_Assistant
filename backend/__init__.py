"""
File Summarizer Package

A Python package for summarizing various file types including text files,
PDFs, Word documents, and more using AI-powered text processing.
"""

__version__ = "1.0.0"
__author__ = "Your Name"
__email__ = "your.email@example.com"

# Import main classes and functions for easy access
from .summarizer import FileSummarizer
from .utils import supported_formats, validate_file
from .exceptions import UnsupportedFileError, SummarizerError

# Define what gets imported when using "from file_summarizer import *"
__all__ = [
    'FileSummarizer',
    'supported_formats',
    'validate_file',
    'UnsupportedFileError',
    'SummarizerError'
]

# Package-level constants
SUPPORTED_FORMATS = ['.txt', '.pdf', '.docx', '.doc', '.rtf', '.md']
DEFAULT_SUMMARY_LENGTH = 3  # Number of sentences
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes
