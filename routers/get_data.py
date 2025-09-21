from fastapi import APIRouter, HTTPException, Body, Request
from starlette import status
import os
import json

router = APIRouter(prefix="/data", tags=["get data"])


@router.get("/test", status_code=status.HTTP_200_OK)
def get_data():
    return {"msg": "hello world!"}


def get_spaces_and_levels():
    fn = "dist/data/SpaceEquipmentData_185171_biocontainment_research_facility.json"
    with open(fn, "r", encoding="utf-8") as f:
        all_data = json.load(f)
    spaces = []
    levels = []
    for data in all_data["data"]:
        if data['category'] == 'space':
            spaces.append(data)
        if data["level"] not in levels:
            levels.append(data["level"])
    return spaces, levels


@router.get("/", status_code=status.HTTP_200_OK)
def get_data():
    print("ok")
    spaces, levels = get_spaces_and_levels()
    return {"spaces": spaces, "levels": levels}
