from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import json

class ActionSetInterviewSettings(Action):
    def name(self) -> Text:
        return "action_set_interview_settings"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        settings = json.loads(tracker.latest_message.get("text", "{}"))
        return [
            SlotSet("interviewer_style", settings.get("interviewerStyle")),
            SlotSet("interview_type", settings.get("interviewType"))
        ]

class ActionEvaluateResponse(Action):
    def name(self) -> Text:
        return "action_evaluate_response"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        response = tracker.latest_message.get("text", "")
        interview_type = tracker.get_slot("interview_type")
        
        # Basic evaluation logic - replace with more sophisticated NLP
        evaluation = self._evaluate_response(response, interview_type)
        
        dispatcher.utter_message(json.dumps({
            "text": evaluation["feedback"],
            "confidence": evaluation["confidence"],
            "evaluation": evaluation["feedback"],
            "suggestions": evaluation["suggestions"]
        }))
        
        return []

    def _evaluate_response(self, response: str, interview_type: str) -> Dict[str, Any]:
        # Simple keyword-based evaluation - replace with proper NLP
        keywords = {
            "technical": ["function", "variable", "code", "algorithm", "data"],
            "behavioral": ["experience", "team", "project", "challenge", "solution"]
        }
        
        response_lower = response.lower()
        relevant_keywords = keywords.get(interview_type, keywords["technical"])
        matched_keywords = sum(1 for word in relevant_keywords if word in response_lower)
        confidence = min(matched_keywords / len(relevant_keywords), 1.0)
        
        return {
            "confidence": confidence,
            "feedback": self._generate_feedback(confidence),
            "suggestions": self._generate_suggestions(confidence, interview_type)
        }

    def _generate_feedback(self, confidence: float) -> str:
        if confidence > 0.8:
            return "Excellent response! Your explanation was clear and comprehensive."
        elif confidence > 0.6:
            return "Good response. You covered the main points well."
        else:
            return "Your response could be more detailed. Try to include more specific examples."

    def _generate_suggestions(self, confidence: float, interview_type: str) -> List[str]:
        suggestions = []
        if confidence < 0.8:
            if interview_type == "technical":
                suggestions.extend([
                    "Include more technical details",
                    "Provide code examples",
                    "Explain the underlying concepts"
                ])
            else:
                suggestions.extend([
                    "Share specific examples from your experience",
                    "Describe the impact of your actions",
                    "Explain your decision-making process"
                ])
        return suggestions

class ActionAskFollowUp(Action):
    def name(self) -> Text:
        return "action_ask_follow_up"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        current_question = tracker.get_slot("question")
        interview_type = tracker.get_slot("interview_type")
        
        follow_up = self._generate_follow_up(current_question, interview_type)
        
        dispatcher.utter_message(json.dumps({
            "text": follow_up,
            "followUpQuestion": follow_up
        }))
        
        return [SlotSet("question", follow_up)]

    def _generate_follow_up(self, current_question: str, interview_type: str) -> str:
        # Simple follow-up logic - replace with more sophisticated NLP
        if "closure" in current_question.lower():
            return "Can you provide a practical example of using closures in a real project?"
        elif "react" in current_question.lower():
            return "How would you optimize the performance of a React component?"
        else:
            return "Can you elaborate on your previous answer with more specific examples?"

class ActionStoreCandidateResponse(Action):
    def name(self) -> Text:
        return "action_store_candidate_response"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        response = tracker.latest_message.get("text", "")
        return [SlotSet("candidate_response", response)]

class ActionStoreQuestion(Action):
    def name(self) -> Text:
        return "action_store_question"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        question = tracker.latest_message.get("text", "")
        return [SlotSet("question", question)]