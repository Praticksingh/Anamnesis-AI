from app.schemas import UnifiedTimelineEvent


def calculate_calibration(timeline: list[UnifiedTimelineEvent], divergence_year: int) -> int:
    """Assess the structural and chronological plausibility of simulated timeline events.

    Returns a calibration score from 0 to 100 representing how well calibrated
    and paced the transition sequence is.
    """
    if not timeline:
        return 100

    score = 100

    # 1. Chronology check: Verify timeline is sorted chronologically
    last_year = -float("inf")
    is_ordered = True
    for ev in timeline:
        if ev.year < last_year:
            is_ordered = False
        last_year = ev.year

    if not is_ordered:
        score -= 30

    # 2. Year gaps check: Detect large gaps (e.g., >30 years between consecutive events)
    years = [ev.year for ev in timeline]
    years.sort()
    for i in range(len(years) - 1):
        if years[i+1] - years[i] > 30:
            score -= 15
            break

    # 3. Density bottleneck check: Detect year clustering (e.g., >3 events in the same year)
    from collections import Counter
    year_counts = Counter(years)
    for y, count in year_counts.items():
        if count > 3:
            score -= 10
            break

    # 4. Check for baseline anomalies (e.g. years below a reasonable minimum like 0)
    for y in years:
        if y < 0:
            score -= 20
            break

    return max(0, min(100, score))
