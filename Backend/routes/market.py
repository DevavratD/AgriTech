from fastapi import APIRouter, HTTPException
import requests
from typing import Optional

router = APIRouter(
    prefix="/api/market",
    tags=["market"],
    responses={404: {"description": "Not found"}},
)

@router.get("/insights")
async def get_market_insights(
    commodity: str, 
    state: str, 
    market: str
):
    """
    Proxy endpoint to fetch market insights from AgMarknet API
    """
    try:
        url = f"https://agmarket-api.onrender.com/request?commodity={commodity}&state={state}&market={market}"
        response = requests.get(url)
        
        # Check if the request was successful
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Failed to fetch market data: {response.text}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching market data: {str(e)}"
        )
