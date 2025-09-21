from routers import ask_ai, get_data, get_mongodb
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import json
import os
from dotenv import load_dotenv
load_dotenv()


app = FastAPI()

origins = [
    "*",
    "http://localhost:5173",            # Vite local dev
    "http://localhost:3000",            # CRA/Next local dev
    "https://py-react-test.onrender.com"  # your deployed frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # allow_origins=origins,  # Quasar dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(get_data.router)
app.include_router(get_mongodb.router)
app.include_router(ask_ai.router)


# # app.mount("/static", StaticFiles(directory="dist", html=True), name="static")
# frontend_dist = os.path.join(os.path.dirname(__file__), "frontend", "dist")
# app.mount("/",
#           StaticFiles(directory=frontend_dist, html=True),
#           name="frontend")


'''

uvicorn server:app --host 127.0.0.1 --port 8000 --reload --reload-exclude ifc --reload-exclude data

'''


# uvicorn server:app --host 127.0.0.1 --port 8000 --reload --reload-exclude ifc --reload-exclude data
