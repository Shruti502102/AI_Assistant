import re
import json
from typing import Tuple, List, Dict, Any

class AIAssistant:
    def __init__(self):
        # Simple rule-based system for demonstration
        # In production, integrate with OpenAI API or similar
        pass
    
    def generate_summary(self, document_text: str) -> str:
        """Generate a concise summary of the document (≤150 words)"""
        # Simple extractive summarization
        sections = self._split_into_sections(document_text)
        
        # Get key sentences from each section
        key_sentences = []
        for section in sections[:5]:  # Limit to first 5 sections
            sentences = self._split_into_sentences(section)
            if sentences:
                # Take first sentence of each section (usually key info)
                key_sentences.append(sentences[0])
        
        summary = ' '.join(key_sentences)
        
        # Ensure summary is within 150 words
        words = summary.split()
        if len(words) > 150:
            summary = ' '.join(words[:150]) + '...'
        
        return summary
    
    def answer_question(self, question: str, document_text: str, 
                       conversation_history: List[Dict]) -> Tuple[str, str]:
        """Answer a question based on document content"""
        # Simple keyword-based search and response
        question_lower = question.lower()
        
        # Find relevant sections
        relevant_sections = self._find_relevant_sections(question_lower, document_text)
        
        if not relevant_sections:
            return ("I couldn't find relevant information in the document to answer your question.", 
                   "No matching content found in the document.")
        
        # Generate answer based on relevant sections
        answer = self._generate_answer_from_sections(question, relevant_sections)
        justification = f"This answer is based on content found in the document, specifically from sections containing keywords related to your question."
        
        return answer, justification
    
    def evaluate_answer(self, question: str, user_answer: str, 
                       expected_answer: str, document_text: str) -> Dict[str, Any]:
        """Evaluate user's answer against expected answer"""
        user_words = set(user_answer.lower().split())
        expected_words = set(expected_answer.lower().split())
        
        # Simple similarity check
        overlap = len(user_words.intersection(expected_words))
        total_words = len(expected_words)
        
        if total_words == 0:
            similarity = 0
        else:
            similarity = overlap / total_words
        
        if similarity >= 0.7:
            score = "Excellent"
            feedback = "Your answer demonstrates good understanding of the document content."
        elif similarity >= 0.5:
            score = "Good"
            feedback = "Your answer is mostly correct but could include more key details."
        elif similarity >= 0.3:
            score = "Partial"
            feedback = "Your answer touches on the topic but misses some important points."
        else:
            score = "Needs Improvement"
            feedback = "Your answer doesn't align well with the document content."
        
        return {
            'score': score,
            'feedback': feedback,
            'similarity': round(similarity * 100, 1),
            'justification': f"Evaluated based on keyword overlap and content relevance to the source document."
        }
    
    def _split_into_sections(self, text: str) -> List[str]:
        """Split text into logical sections"""
        # Split by paragraphs
        sections = text.split('\n\n')
        return [s.strip() for s in sections if s.strip()]
    
    def _split_into_sentences(self, text: str) -> List[str]:
        """Split text into sentences"""
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _find_relevant_sections(self, question: str, document_text: str) -> List[str]:
        """Find sections of document relevant to the question"""
        sections = self._split_into_sections(document_text)
        relevant_sections = []
        
        # Extract keywords from question
        question_words = set(re.findall(r'\b\w+\b', question.lower()))
        
        # Remove common stop words
        stop_words = {'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 
                     'with', 'to', 'for', 'of', 'as', 'by', 'that', 'this', 'it', 'from', 
                     'what', 'where', 'when', 'how', 'why', 'who', 'which', 'whom'}
        question_words = question_words - stop_words
        
        # Score sections based on keyword overlap
        for section in sections:
            section_words = set(re.findall(r'\b\w+\b', section.lower()))
            overlap = len(question_words.intersection(section_words))
            
            if overlap > 0:
                relevant_sections.append((section, overlap))
        
        # Sort by relevance score and return top sections
        relevant_sections.sort(key=lambda x: x[1], reverse=True)
        return [section[0] for section in relevant_sections[:3]]
    
    def _generate_answer_from_sections(self, question: str, sections: List[str]) -> str:
        """Generate answer from relevant sections"""
        if not sections:
            return "I couldn't find relevant information to answer your question."
        
        # Simple approach: return the most relevant section with some context
        best_section = sections[0]
        
        # Try to find the most relevant sentence within the section
        sentences = self._split_into_sentences(best_section)
        if sentences:
            question_words = set(re.findall(r'\b\w+\b', question.lower()))
            best_sentence = sentences[0]
            max_overlap = 0
            
            for sentence in sentences:
                sentence_words = set(re.findall(r'\b\w+\b', sentence.lower()))
                overlap = len(question_words.intersection(sentence_words))
                if overlap > max_overlap:
                    max_overlap = overlap
                    best_sentence = sentence
            
            return best_sentence
        
        return best_section[:500] + "..." if len(best_section) > 500 else best_section
