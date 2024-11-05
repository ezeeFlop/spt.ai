import math

def calculate_reading_time(content: str) -> str:
    words = content.split()
    words_per_minute = 200
    minutes = math.ceil(len(words) / words_per_minute)
    return f"{minutes} min read"
