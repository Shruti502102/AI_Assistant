import re
import random
from typing import List, Dict, Any

class QuestionGenerator:
    def __init__(self):
        self.question_templates = [
            "What is the main purpose of {topic}?",
            "How does {topic} relate to {concept}?",
            "What are the key characteristics of {topic}?",
            "Why is {topic} important?",
            "What challenges are associated with {topic}?",
            "How can {topic} be improved?",
            "What is the relationship between {topic} and {concept}?",
            "What are the benefits of {topic}?",
            "What factors influence {topic}?",
            "How is {topic} implemented?"
        ]
    
    def generate_questions(self, document_text: str) -> List[Dict[str, Any]]:
        """Generate 3 logic-based questions from the document"""
        # Extract key topics and concepts
        topics = self._extract_key_topics(document_text)
        concepts = self._extract_concepts(document_text)
        
        questions = []
        sections = self._split_into_sections(document_text)
        
        # Generate different types of questions
        for i in range(3):
            if i == 0:
                # Factual question
                question, answer = self._generate_factual_question(sections, topics)
            elif i == 1:
                # Analytical question
                question, answer = self._generate_analytical_question(sections, topics, concepts)
            else:
                # Comprehension question
                question, answer = self._generate_comprehension_question(sections, topics)
            
            questions.append({
                'id': i,
                'question': question,
                'expected_answer': answer,
                'type': ['factual', 'analytical', 'comprehension'][i]
            })
        
        return questions
    
    def _extract_key_topics(self, text: str) -> List[str]:
        """Extract key topics from the document"""
        # Simple noun phrase extraction
        words = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
        
        # Count frequency
        word_count = {}
        for word in words:
            word_count[word] = word_count.get(word, 0) + 1
        
        # Return top topics
        sorted_topics = sorted(word_count.items(), key=lambda x: x[1], reverse=True)
        return [topic[0] for topic in sorted_topics[:10]]
    
    def _extract_concepts(self, text: str) -> List[str]:
        """Extract conceptual terms from the document"""
        # Look for technical terms, definitions, and important concepts
        concept_patterns = [
            r'\b(?:method|approach|technique|strategy|process|system|model|framework|theory)\b',
            r'\b(?:principle|concept|idea|notion|aspect|factor|element|component)\b',
            r'\b(?:analysis|evaluation|assessment|measurement|calculation|determination)\b'
        ]
        
        concepts = []
        for pattern in concept_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            concepts.extend(matches)
        
        return list(set(concepts))
    
    def _split_into_sections(self, text: str) -> List[str]:
        """Split text into logical sections"""
        sections = text.split('\n\n')
        return [s.strip() for s in sections if s.strip() and len(s.strip()) > 50]
    
    def _generate_factual_question(self, sections: List[str], topics: List[str]) -> tuple:
        """Generate a factual question about the document"""
        if not sections or not topics:
            return "What is the main topic discussed in this document?", "The document discusses various topics as presented in the content."
        
        # Pick a section with good content
        section = random.choice(sections[:3])  # Use first few sections
        sentences = re.split(r'[.!?]+', section)
        
        if len(sentences) >= 2:
            fact_sentence = sentences[0].strip()
            if len(fact_sentence) > 20:
                # Create question about this fact
                question = f"According to the document, what key information is provided about {topics[0] if topics else 'the main topic'}?"
                return question, fact_sentence
        
        return "What is the primary focus of this document?", section[:200] + "..."
    
    def _generate_analytical_question(self, sections: List[str], topics: List[str], concepts: List[str]) -> tuple:
        """Generate an analytical question requiring reasoning"""
        if not sections:
            return "How do the concepts in this document relate to each other?", "The document presents interconnected concepts that build upon each other."
        
        # Find a section with multiple concepts
        analytical_section = None
        for section in sections:
            if len(section.split()) > 50:  # Substantial content
                analytical_section = section
                break
        
        if not analytical_section:
            analytical_section = sections[0]
        
        topic = topics[0] if topics else "the main subject"
        question = f"How does the document explain the relationship between {topic} and its associated concepts?"
        
        # Create answer based on the analytical section
        answer = analytical_section[:300] + "..." if len(analytical_section) > 300 else analytical_section
        
        return question, answer
    
    def _generate_comprehension_question(self, sections: List[str], topics: List[str]) -> tuple:
        """Generate a comprehension question testing understanding"""
        if not sections:
            return "What can you conclude from this document?", "The document provides insights that lead to various conclusions."
        
        # Use a middle section for comprehension
        section_index = len(sections) // 2 if len(sections) > 2 else 0
        section = sections[section_index]
        
        topic = topics[0] if topics else "the subject matter"
        question = f"Based on the document's discussion of {topic}, what conclusions can be drawn?"
        
        # Extract key insights for the answer
        sentences = re.split(r'[.!?]+', section)
        key_insights = []
        
        for sentence in sentences:
            if len(sentence.strip()) > 30 and any(word in sentence.lower() for word in ['important', 'significant', 'key', 'main', 'primary', 'essential', 'crucial']):
                key_insights.append(sentence.strip())
        
        if key_insights:
            answer = '. '.join(key_insights[:2]) + '.'
        else:
            answer = section[:250] + "..." if len(section) > 250 else section
        
        return question, answer
