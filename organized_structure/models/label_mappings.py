"""
Label mappings for ML model predictions
These mappings convert model class indices to human-readable labels
"""

# Behavior labels (4 total) - from training code line 3032-3037
BEHAVIOR_LABELS = [
    "maintainer",
    "team_player",
    "innovator",
    "learner"
]

# Skills labels (30 total) - Most common GitHub languages/technologies
# These are ordered by frequency in GitHub data
# Note: The actual order should match your training CSV (skills_labels_fine_grained.csv)
SKILL_LABELS = [
    "JavaScript",
    "Python",
    "Java",
    "TypeScript",
    "C++",
    "C",
    "PHP",
    "C#",
    "Shell",
    "Ruby",
    "Go",
    "Rust",
    "Kotlin",
    "Swift",
    "Scala",
    "Dart",
    "R",
    "Objective-C",
    "Perl",
    "Haskell",
    "Lua",
    "Elixir",
    "Clojure",
    "Julia",
    "HTML",
    "CSS",
    "SQL",
    "MATLAB",
    "Assembly",
    "Other"
]


def decode_behavior_predictions(predictions):
    """
    Convert behavior model predictions to readable format.
    
    Args:
        predictions: Binary array [1, 0, 1, 0] indicating which behaviors are present
        
    Returns:
        Dictionary with behavior profile
    """
    if len(predictions) != len(BEHAVIOR_LABELS):
        raise ValueError(f"Expected {len(BEHAVIOR_LABELS)} predictions, got {len(predictions)}")
    
    # Extract positive behaviors
    active_behaviors = [BEHAVIOR_LABELS[i] for i, val in enumerate(predictions) if val == 1]
    
    # If no behaviors detected, default to the most likely ones
    if not active_behaviors:
        active_behaviors = ["balanced_contributor"]
    
    # Create behavior profile with primary and secondary traits
    primary = active_behaviors[0] if active_behaviors else "balanced_contributor"
    secondary = active_behaviors[1:] if len(active_behaviors) > 1 else []
    
    return {
        'primary_type': primary,
        'secondary_traits': secondary,
        'all_behaviors': active_behaviors,
        'raw_predictions': predictions.tolist() if hasattr(predictions, 'tolist') else list(predictions)
    }


def decode_skills_predictions(predictions, top_n=10):
    """
    Convert skills model predictions to readable format.
    
    Args:
        predictions: Binary array [1, 0, 0, 1, ...] indicating which skills are present
        top_n: Number of top skills to return
        
    Returns:
        List of skill names
    """
    if len(predictions) > len(SKILL_LABELS):
        # Truncate to available labels
        predictions = predictions[:len(SKILL_LABELS)]
    
    # Extract active skills
    active_skills = [SKILL_LABELS[i] for i, val in enumerate(predictions) if val == 1 and i < len(SKILL_LABELS)]
    
    # If model predicts too many or too few, take top N
    if len(active_skills) == 0:
        # Fallback: return first few as defaults
        return SKILL_LABELS[:min(top_n, len(SKILL_LABELS))]
    
    return active_skills[:top_n] if len(active_skills) > top_n else active_skills


# Readable descriptions for behavior types
BEHAVIOR_DESCRIPTIONS = {
    "maintainer": {
        "title": "Maintainer",
        "description": "Actively maintains and improves existing projects",
        "traits": ["Consistent contributor", "Long-term commitment", "Quality-focused"]
    },
    "team_player": {
        "title": "Team Player",
        "description": "Collaborates well with others through reviews and contributions",
        "traits": ["Collaborative", "Code reviewer", "Community-engaged"]
    },
    "innovator": {
        "title": "Innovator",
        "description": "Creates new projects and explores new technologies",
        "traits": ["Creative", "Experimental", "Technology explorer"]
    },
    "learner": {
        "title": "Learner",
        "description": "Continuously learning and expanding technical skills",
        "traits": ["Growth-oriented", "Technology diversity", "Skill builder"]
    }
}

