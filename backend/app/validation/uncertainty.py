import math
from app.schemas import AgentOutputSummary


def calculate_uncertainty(agent_outputs: list[AgentOutputSummary]) -> float:
    """Calculate the uncertainty score based on the statistical variance of agent impact scores.

    Returns a float from 0.0 (low uncertainty/high consensus) to 10.0 (high uncertainty/low consensus).
    """
    scores = [out.impact_score for out in agent_outputs if out.impact_score is not None]
    
    if len(scores) < 2:
        return 0.0

    mean_score = sum(scores) / len(scores)
    variance = sum((s - mean_score) ** 2 for s in scores) / (len(scores) - 1)
    std_dev = math.sqrt(variance)

    # Scale standard deviation to a 0.0 - 10.0 index.
    # We divide std_dev by 5 and cap it at 10.0.
    uncertainty = min(10.0, std_dev / 5.0)
    return round(uncertainty, 2)
