from fastapi import APIRouter, Path, HTTPException
from starlette import status
from pydantic import BaseModel
import pymongo
from openai import OpenAI
import os
import json
from dotenv import load_dotenv
load_dotenv()

client = OpenAI()

router = APIRouter(prefix="/ai", tags=["ai-query"])

# MONGODB_URI = "mongodb+srv://imnirviksaha_db_user:3SIX8nj3QWXmDE2B@cluster0.yztu7ll.mongodb.net/model-query?retryWrites=true&w=majority&appName=Cluster0"
MONGODB_URI = "mongodb://localhost:27017"
db_client = pymongo.MongoClient(MONGODB_URI)
db = db_client["model-query"]


class QuestionModel(BaseModel):
    question: str
    building: str


def nl_to_mongo(question: str) -> dict:
    system_prompt = f"""
    You are an assistant that converts natural language into MongoDB queries.
    Only return the query object (the dictionary inside db.office.find()).
    Do NOT include 'db.office.find()' or any code.
    Use valid JSON format.
    Only consider 'walls', 'floor', 'roof', 'doors', 'windows', 
    Map them to these element_type values:
    - wall → IfcWall
    - wall → IfcWallStandardCase
    - floor → IfcSlab
    - roof → IfcRoof
    - door → IfcDoor
    - window → IfcWindow
    Include at least one of the conditions so that:
     - element_type
     - product_name, 
     - category exists
    """

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question}
        ],
    )

    query_json = response.choices[0].message.content.strip()
    return json.loads(query_json)


@router.post("/query")
async def ask_question(query: QuestionModel):
    print(query)
    if query.building == "facility":
        collection = db["biocontainment_185171_ifc"]
    elif query.building == "office":
        collection = db["office"]
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="project not in db")
    query_dict = nl_to_mongo(query.question)
    print(query_dict)
    output = []
    unique_levels = []
    results = collection.find(query_dict)
    for item in results:
        item["_id"] = str(item["_id"])
        output.append(item)
    return {"building_elements": output, "unique_levels": unique_levels}


@router.post("/check-query-type")
async def check_query_type(query: QuestionModel):
    print(query)
