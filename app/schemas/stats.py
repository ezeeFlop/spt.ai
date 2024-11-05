from enum import Enum
from pydantic import BaseModel
from typing import List

class TimeRange(str, Enum):
    WEEK = "week"
    MONTH = "month"
    YEAR = "year"

class StatsResponse(BaseModel):
    labels: List[str]
    data: List[float]

    class Config:
        from_attributes = True
