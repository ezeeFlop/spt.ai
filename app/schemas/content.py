from pydantic import BaseModel
from typing import List, Literal

class Hero(BaseModel):
    title: str
    subtitle: str
    ctaPrimary: str
    ctaSecondary: str

class FeatureItem(BaseModel):
    icon: Literal['Brain', 'Sparkles', 'Zap']
    title: str
    description: str

class Features(BaseModel):
    title: str
    subtitle: str
    items: List[FeatureItem]

class HomeContent(BaseModel):   
    hero: Hero
    features: Features

class ContentResponse(BaseModel):
    content: HomeContent
