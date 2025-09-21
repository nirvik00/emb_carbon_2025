from uuid import uuid4
from bson.objectid import ObjectId
# from contextlib import asynccontextmanager
# from pydantic import BaseModel
# from typing import Optional
import pymongo
from fastapi import APIRouter, HTTPException, Request, Path
# import os
# import json
from dotenv import load_dotenv
load_dotenv()

router = APIRouter(prefix="/db", tags=["db data"])

# MONGODB_URI = "mongodb+srv://imnirviksaha_db_user:3SIX8nj3QWXmDE2B@cluster0.yztu7ll.mongodb.net/model-query?retryWrites=true&w=majority&appName=Cluster0"
MONGODB_URI = "mongodb://localhost:27017"
client = pymongo.MongoClient(MONGODB_URI)
# db = client["model-query"]
db = client["aecTechBoston2025"]

# collection = db["biocontainment_185171_ifc"]
# collection = db["office"]

# project: facility
# element_types = ['IfcCurtainWall', 'IfcDoor', 'IfcRailing', 'IfcRamp', 'IfcRampFlight', 'IfcRoof',
#                  'IfcSlab', 'IfcStair', 'IfcStairFlight', 'IfcWall', 'IfcWallStandardCase',
#                  'IfcFurnishingElement', 'IfcBuilding', 'IfcSite', 'IfcSpace']

# project: office
# element_types = ['IfcDoor', 'IfcRoof', 'IfcSlab', 'IfcWall', 'IfcWallStandardCase', 'IfcWindow',  'IfcFurnishingElement']
# element_types = ['IfcDoor', 'IfcRoof', 'IfcSlab', 'IfcWall', 'IfcWallStandardCase', 'IfcWindow',  'IfcFurnishingElement',
# ',  'IfcFurnishingElement', 'IfcSpace']


#
# walls, floor, ceilings, roof,
# curtain walls

@router.get("/facility/element/{elem}")
def get_data_parametric(elem: str = Path(description="building element", example="walls")):
    print(elem)
    collection = db["biocontainment_185171_ifc"]
    if elem == "slabs":
        query = {"element_type": "IfcSlab"}
    elif elem == "roofs":
        query = {"element_type": "IfcRoof"}
    elif elem == "doors":
        query = {"element_type": "IfcDoor"}
    elif elem == "furniture":
        query = {"element_type": "IfcFurnishingElement"}
    else:
        query_items = ["IfcWall", "IfcWallStandardCase"]
        query = {"element_type": {"$in": query_items}}
    # print(query)
    cursor = collection.find(query)
    output = []
    unique_levels = []
    for item in cursor:
        item["_id"] = str(item["_id"])
        if item["level"] not in unique_levels:
            unique_levels.append(item["level"])
        output.append(item)
    #
    return {"building_elements": output, "unique_levels": unique_levels}


@router.get("/facility/building")
def get_spaces_and_levels():
    print('building')
    collection = db["biocontainment_185171_ifc"]
    query_items = ["IfcWall", "IfcWallStandardCase",
                   "IfcSlab", "IfcRoof", "IfcDoor"]
    query = {"element_type": {"$in": query_items}}
    cursor = collection.find(query)
    output = []
    unique_levels = []
    for item in cursor:
        item["_id"] = str(item["_id"])
        if item["level"] not in unique_levels:
            unique_levels.append(item["level"])
        output.append(item)
    return {"building_elements": output, "unique_levels": unique_levels}


@router.get("/facility/spaces")
def get_spaces_and_levels():
    print('spaces')
    collection = db["biocontainment_185171_ifc"]
    query = {"product_name": "IfcSpace"}
    cursor = collection.find(query)
    output = []
    unique_levels = []
    for item in cursor:
        item["_id"] = str(item["_id"])
        output.append(item)
    return {"building_elements": output, "unique_levels": unique_levels}


@router.get("/office/building")
def get_spaces_and_levels2():
    print('building')
    collection = db["office"]
    query_items = ["IfcWall", "IfcWallStandardCase",
                   "IfcSlab", "IfcDoor", "IfcWindow"]
    query = {"element_type": {"$in": query_items}}
    cursor = collection.find(query)
    output = []
    unique_levels = []
    for item in cursor:
        item["_id"] = str(item["_id"])
        if item["level"] not in unique_levels:
            unique_levels.append(item["level"])
        output.append(item)
    return {"building_elements": output, "unique_levels": unique_levels}


@router.get("/office/spaces")
def get_spaces_and_levels2():
    collection = db["office"]
    query = {"product_name": "IfcSpace"}
    cursor = collection.find(query)
    output = []
    unique_levels = []
    for item in cursor:
        item["_id"] = str(item["_id"])
        output.append(item)
    print(len(output), unique_levels)
    return {"building_elements": output, "unique_levels": unique_levels}


@router.get("/office/element/{elem}")
def get_data_parametric2(elem: str = Path(description="building element", example="walls")):
    print(elem)
    collection = db["office"]
    if elem == "slabs":
        query = {"element_type": "IfcSlab"}
    elif elem == "roofs":
        query = {"element_type": "IfcRoof"}
    elif elem == "doors":
        query = {"element_type": "IfcDoor"}
    elif elem == "windows":
        query = {"element_type": "IfcWindow"}
    elif elem == "furniture":
        query = {"element_type": "IfcFurnishingElement"}
    else:
        query_items = ["IfcWall", "IfcWallStandardCase"]
        query = {"element_type": {"$in": query_items}}
    # print(query)
    cursor = collection.find(query)
    output = []
    unique_levels = []
    for item in cursor:
        item["_id"] = str(item["_id"])
        if item["level"] not in unique_levels:
            unique_levels.append(item["level"])
        output.append(item)
    #
    return {"building_elements": output, "unique_levels": unique_levels}


@router.get("/kentwood/element/{elem}")
def get_data_parametric3(elem: str = Path(description="building element", example="walls")):
    print(elem)
    collection = db["kentwood2"]
    if elem == "slabs":
        query = {"element_type": "IfcSlab"}
    elif elem == "roofs":
        query = {"element_type": "IfcRoof"}
    elif elem == "doors":
        query = {"element_type": "IfcDoor"}
    elif elem == "furniture":
        query = {"element_type": "IfcFurnishingElement"}
    else:
        # query_items = ["IfcWall", "IfcWallStandardCase"]
        # query = {"element_type": {"$in": query_items}}
        query = {"element_type": "IfcFurnishingElement"}
    # print(query)
    cursor = collection.find(query)
    output = []
    unique_levels = []
    for item in cursor:
        item["_id"] = str(item["_id"])
        if item["level"] not in unique_levels:
            unique_levels.append(item["level"])
        output.append(item)
    #
    return {"building_elements": output, "unique_levels": unique_levels}


@router.get("/kentwood/get/{id}")
def getId(id: str):
    print("id:", id)
    with open("CalculatedValues.csv", 'r') as f:
        data = f.readlines()
    for line in data:
        arr = line.split(",")
        print(arr)
        if id == arr[4]:
            return arr
    return []


@router.get("/kentwood/building")
def get_spaces_and_levels3():
    print('building')
    collection = db["kentwood2"]
    query_items = ["IfcWall", "IfcWallStandardCase",
                   "IfcSlab", "IfcRoof", "IfcDoor"]
    query = {"element_type": {"$in": query_items}}
    cursor = collection.find(query)
    output = []
    unique_levels = []
    for item in cursor:
        item["_id"] = str(item["_id"])
        if item["level"] not in unique_levels:
            unique_levels.append(item["level"])
        output.append(item)
    return {"building_elements": output, "unique_levels": unique_levels}


@router.get("/kentwood/spaces")
def get_spaces_and_levels3():
    print('spaces')
    collection = db["kentwood2"]
    query = {"product_name": "IfcSpace"}
    cursor = collection.find(query)
    output = []
    unique_levels = []
    for item in cursor:
        item["_id"] = str(item["_id"])
        output.append(item)
    return {"building_elements": output, "unique_levels": unique_levels}
