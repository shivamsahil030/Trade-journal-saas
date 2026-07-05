from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
# Load .env if present; missing files are ignored so the app also boots
# with plain environment variables or built-in defaults.
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field


# ---------- Config ----------
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60 * 24 * 7  # 7 days for good UX
REFRESH_TOKEN_DAYS = 30
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 15

# Sensible local-development defaults so `python server.py` works
# even without a .env file. Override in production via environment.
DEFAULTS = {
    "MONGO_URL": "mongodb://localhost:27017",
    "DB_NAME": "trade_journal",
    "JWT_SECRET": "dev-only-insecure-secret-change-me",
    "ADMIN_EMAIL": "admin@tradejournal.com",
    "ADMIN_PASSWORD": "Admin@123",
    "FRONTEND_URL": "http://localhost:3000",
    "CORS_ORIGINS": "*",
}
for _k, _v in DEFAULTS.items():
    os.environ.setdefault(_k, _v)

mongo_url = os.environ["MONGO_URL"]
db_name = os.environ["DB_NAME"]
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

app = FastAPI(title="Trade Journal API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ---------- Helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES),
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_DAYS),
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    response.set_cookie(
        key="access_token", value=access, httponly=True, secure=True,
        samesite="none", max_age=ACCESS_TOKEN_MINUTES * 60, path="/",
    )
    response.set_cookie(
        key="refresh_token", value=refresh, httponly=True, secure=True,
        samesite="none", max_age=REFRESH_TOKEN_DAYS * 86400, path="/",
    )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


def user_out(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name", ""),
        "role": user.get("role", "user"),
        "created_at": user.get("created_at").isoformat() if isinstance(user.get("created_at"), datetime) else user.get("created_at"),
    }


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------- Models ----------
class RegisterInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=1, max_length=80)


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordInput(BaseModel):
    email: EmailStr


class ResetPasswordInput(BaseModel):
    token: str
    password: str = Field(min_length=6, max_length=128)


class UpdateProfileInput(BaseModel):
    name: Optional[str] = Field(default=None, max_length=80)


class JournalInput(BaseModel):
    trade_date: str  # ISO date string
    stock_name: str = Field(min_length=1, max_length=120)
    trade_setup: str = Field(min_length=1, max_length=60)
    trade_logic: str = Field(default="", max_length=5000)
    lesson_learned: str = Field(default="", max_length=5000)
    tags: List[str] = Field(default_factory=list)
    screenshot: Optional[str] = None  # base64 data URL


class JournalOut(BaseModel):
    id: str
    user_id: str
    trade_date: str
    stock_name: str
    trade_setup: str
    trade_logic: str
    lesson_learned: str
    tags: List[str]
    screenshot: Optional[str] = None
    created_at: str
    updated_at: str


def journal_to_out(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "user_id": str(doc["user_id"]),
        "trade_date": doc.get("trade_date", ""),
        "stock_name": doc.get("stock_name", ""),
        "trade_setup": doc.get("trade_setup", ""),
        "trade_logic": doc.get("trade_logic", ""),
        "lesson_learned": doc.get("lesson_learned", ""),
        "tags": doc.get("tags", []),
        "screenshot": doc.get("screenshot"),
        "created_at": doc["created_at"].isoformat() if isinstance(doc.get("created_at"), datetime) else doc.get("created_at", ""),
        "updated_at": doc["updated_at"].isoformat() if isinstance(doc.get("updated_at"), datetime) else doc.get("updated_at", ""),
    }


# ---------- Brute force ----------
async def check_and_increment_attempts(identifier: str) -> None:
    now = datetime.now(timezone.utc)
    record = await db.login_attempts.find_one({"identifier": identifier})
    if record and record.get("locked_until") and record["locked_until"] > now:
        raise HTTPException(status_code=429, detail="Too many failed attempts. Try again later.")


async def register_failed_attempt(identifier: str) -> None:
    now = datetime.now(timezone.utc)
    record = await db.login_attempts.find_one({"identifier": identifier})
    count = (record.get("count", 0) if record else 0) + 1
    update = {"identifier": identifier, "count": count, "last_attempt": now}
    if count >= MAX_LOGIN_ATTEMPTS:
        update["locked_until"] = now + timedelta(minutes=LOCKOUT_MINUTES)
        update["count"] = 0
    await db.login_attempts.update_one({"identifier": identifier}, {"$set": update}, upsert=True)


async def clear_attempts(identifier: str) -> None:
    await db.login_attempts.delete_one({"identifier": identifier})


# ---------- Auth Endpoints ----------
@api_router.post("/auth/register")
async def register(payload: RegisterInput, response: Response):
    email = payload.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name.strip(),
        "role": "user",
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    access = create_access_token(str(result.inserted_id), email)
    refresh = create_refresh_token(str(result.inserted_id))
    set_auth_cookies(response, access, refresh)
    return {"user": user_out(doc),}


@api_router.post("/auth/login")
async def login(payload: LoginInput, request: Request, response: Response):
    email = payload.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    await check_and_increment_attempts(identifier)

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        await register_failed_attempt(identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await clear_attempts(identifier)
    access = create_access_token(str(user["_id"]), email)
    refresh = create_refresh_token(str(user["_id"]))
    set_auth_cookies(response, access, refresh)
    return {"user": user_out(user),}


@api_router.post("/auth/logout")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"message": "Logged out"}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"user": user_out(user)}


@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        new_access = create_access_token(str(user["_id"]), user["email"])
        new_refresh = create_refresh_token(str(user["_id"]))
        set_auth_cookies(response, new_access, new_refresh)
        return {"user": user_out(user)}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@api_router.post("/auth/forgot-password")
async def forgot_password(payload: ForgotPasswordInput):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    # Always respond ok to avoid enumeration
    if user:
        token = secrets.token_urlsafe(32)
        expires = datetime.now(timezone.utc) + timedelta(hours=1)
        await db.password_reset_tokens.insert_one({
            "token": token,
            "user_id": user["_id"],
            "expires_at": expires,
            "used": False,
        })
        frontend = os.environ.get("FRONTEND_URL", "")
        reset_link = f"{frontend}/reset-password?token={token}"
        logger.info(f"[PASSWORD RESET] {email}: {reset_link}")
    return {"message": "If the email is registered, a reset link has been sent.", "dev_note": "Check backend logs for the reset link."}


@api_router.post("/auth/reset-password")
async def reset_password(payload: ResetPasswordInput):
    record = await db.password_reset_tokens.find_one({"token": payload.token})
    if not record or record.get("used") or record["expires_at"] < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    await db.users.update_one(
        {"_id": record["user_id"]},
        {"$set": {"password_hash": hash_password(payload.password)}},
    )
    await db.password_reset_tokens.update_one({"_id": record["_id"]}, {"$set": {"used": True}})
    return {"message": "Password reset successful"}


@api_router.patch("/auth/profile")
async def update_profile(payload: UpdateProfileInput, user: dict = Depends(get_current_user)):
    update = {}
    if payload.name is not None:
        update["name"] = payload.name.strip()
    if update:
        await db.users.update_one({"_id": user["_id"]}, {"$set": update})
    fresh = await db.users.find_one({"_id": user["_id"]})
    return {"user": user_out(fresh)}


# ---------- Journals ----------
@api_router.get("/journals")
async def list_journals(user: dict = Depends(get_current_user), q: Optional[str] = None):
    query = {"user_id": user["_id"]}
    if q:
        rgx = {"$regex": q, "$options": "i"}
        query["$or"] = [
            {"stock_name": rgx},
            {"trade_setup": rgx},
            {"tags": rgx},
        ]
    cursor = db.journals.find(query).sort("created_at", -1)
    docs = await cursor.to_list(1000)
    return {"journals": [journal_to_out(d) for d in docs]}


@api_router.post("/journals")
async def create_journal(payload: JournalInput, user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": user["_id"],
        "trade_date": payload.trade_date,
        "stock_name": payload.stock_name.strip(),
        "trade_setup": payload.trade_setup.strip(),
        "trade_logic": payload.trade_logic,
        "lesson_learned": payload.lesson_learned,
        "tags": [t.strip() for t in payload.tags if t.strip()],
        "screenshot": payload.screenshot,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.journals.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"journal": journal_to_out(doc)}


@api_router.get("/journals/{journal_id}")
async def get_journal(journal_id: str, user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(journal_id):
        raise HTTPException(status_code=404, detail="Journal not found")
    doc = await db.journals.find_one({"_id": ObjectId(journal_id), "user_id": user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Journal not found")
    return {"journal": journal_to_out(doc)}


@api_router.put("/journals/{journal_id}")
async def update_journal(journal_id: str, payload: JournalInput, user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(journal_id):
        raise HTTPException(status_code=404, detail="Journal not found")
    doc = await db.journals.find_one({"_id": ObjectId(journal_id), "user_id": user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Journal not found")
    update = {
        "trade_date": payload.trade_date,
        "stock_name": payload.stock_name.strip(),
        "trade_setup": payload.trade_setup.strip(),
        "trade_logic": payload.trade_logic,
        "lesson_learned": payload.lesson_learned,
        "tags": [t.strip() for t in payload.tags if t.strip()],
        "screenshot": payload.screenshot,
        "updated_at": datetime.now(timezone.utc),
    }
    await db.journals.update_one({"_id": doc["_id"]}, {"$set": update})
    fresh = await db.journals.find_one({"_id": doc["_id"]})
    return {"journal": journal_to_out(fresh)}


@api_router.delete("/journals/{journal_id}")
async def delete_journal(journal_id: str, user: dict = Depends(get_current_user)):
    if not ObjectId.is_valid(journal_id):
        raise HTTPException(status_code=404, detail="Journal not found")
    result = await db.journals.delete_one({"_id": ObjectId(journal_id), "user_id": user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Journal not found")
    return {"message": "Deleted"}


# ---------- Health ----------
@api_router.get("/")
async def root():
    return {"message": "Trade Journal API", "status": "ok"}


# ---------- CORS & Startup ----------
frontend_origin = os.environ.get("FRONTEND_URL", "")
allowed_origins = [
    "http://localhost:3000",
    "https://trade-journal-saas-1.onrender.com",
]
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@tradejournal.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc),
        })
        logger.info(f"Seeded admin: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info(f"Updated admin password: {admin_email}")


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.login_attempts.create_index("identifier")
    await db.journals.create_index([("user_id", 1), ("created_at", -1)])
    await seed_admin()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# ---------- Entrypoint ----------
# Enables `python server.py` for local development without any hidden files.
if __name__ == "__main__":
    import uvicorn
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8001"))
    uvicorn.run("server:app", host=host, port=port, reload=True)
