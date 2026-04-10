from dotenv import load_dotenv
load_dotenv()

import os
import jwt as pyjwt
import secrets
import httpx
import time
import hashlib
import json
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from contextlib import asynccontextmanager

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "sixto_portal")
JWT_SECRET = os.environ.get("JWT_SECRET")
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "sixto.developer@gmail.com")
NOTION_API_KEY = os.environ.get("NOTION_API_KEY", "")
NOTION_VERSION = "2022-06-28"
NOTION_BASE = "https://api.notion.com/v1"
AUTH_DEBUG_CODES = os.environ.get("AUTH_DEBUG_CODES", "").strip().lower() in ("1", "true", "yes", "on")

NOTION_DB = {
    "client": "30dec4c7-cb79-81db-810d-e5831e7f56b7",
    "project": "30dec4c7-cb79-8127-ac76-d611f161d499",
    "task": "30dec4c7-cb79-81b2-9ff6-f1a008ab0f87",
    "invoice": "30dec4c7-cb79-810b-9d87-cb00322238ae",
    "meetings": "30dec4c7-cb79-812a-ad23-e8b19e7c0484",
    "proposal": "30dec4c7-cb79-8173-b844-f51ded8cba30",
    "contract": "30dec4c7-cb79-81e8-8a08-cdbb25fb8c11",
    "leads": "30dec4c7-cb79-8113-861b-f773ee1c104b",
    "deliverables": "44576ebd-787e-44aa-8fc3-3a31ea6198f1",
    "updates": "81df2382-16fc-4ac2-bf05-587a7a284973",
    "portal_config": "1612bd69-1515-4eb0-a57e-14833acccfb7",
    "requests": "a63ff4cb-86b4-48ff-b52f-3f9110dded88",
    "portal_users": "ad64ce15-894a-4d2b-a21c-ae05ce319742",
    "portal_documents": "cfa49ec1-ee0f-4c3a-9342-46399071d1e1",
    "milestones": "170f3736-96c5-45c4-a03a-c65cc4dc4e1e",
}


def extract_prop(prop):
    if not prop:
        return None
    t = prop.get("type")
    if t == "title":
        return "".join(x.get("plain_text", "") for x in prop.get("title", []))
    if t == "rich_text":
        return "".join(x.get("plain_text", "") for x in prop.get("rich_text", []))
    if t == "number":
        return prop.get("number")
    if t == "select":
        s = prop.get("select")
        return s.get("name") if s else None
    if t == "multi_select":
        return [s.get("name") for s in prop.get("multi_select", [])]
    if t == "status":
        s = prop.get("status")
        return s.get("name") if s else None
    if t == "date":
        d = prop.get("date")
        return {"start": d.get("start"), "end": d.get("end")} if d else None
    if t == "checkbox":
        return prop.get("checkbox", False)
    if t == "url":
        return prop.get("url")
    if t == "email":
        return prop.get("email")
    if t == "files":
        result = []
        for f in prop.get("files", []):
            if f.get("type") == "file":
                result.append({"name": f.get("name", ""), "url": f["file"]["url"]})
            elif f.get("type") == "external":
                result.append({"name": f.get("name", ""), "url": f["external"]["url"]})
        return result
    if t == "relation":
        return [r.get("id") for r in prop.get("relation", [])]
    if t == "people":
        return [{"name": p.get("name", "")} for p in prop.get("people", [])]
    if t == "formula":
        f = prop.get("formula", {})
        return f.get(f.get("type"))
    if t == "rollup":
        r = prop.get("rollup", {})
        return r.get(r.get("type"))
    return None


def parse_page(page, prop_map):
    props = page.get("properties", {})
    result = {"id": page.get("id")}
    for key, prop_name in prop_map.items():
        result[key] = extract_prop(props.get(prop_name))
    return result


CLIENT_PROPS = {"name": "Company Name", "contact_person": "Contact Person", "email": "Email", "source": "Source", "status": "Status", "industry": "Industry", "stripe": "Stripe", "projects": "Project"}
PROJECT_PROPS = {"name": "Name", "client": "Client", "status": "Status", "project_type": "Project Type", "branch": "Branch", "project_date": "Project Date", "project_health": "Project Health", "client_facing_summary": "Client-Facing Summary", "primary_owner": "Primary Owner", "milestones": "Milestones"}
PROJECT_PROPS_ADMIN = {**PROJECT_PROPS, "estimated_amount": "Estimated Amount"}
TASK_PROPS = {"name": "Name", "project": "Project", "status": "Status", "priority": "Priority", "due_date": "Due Date", "phase": "Phase", "client_visible": "Client Visible", "tag": "Tag", "notes": "Notes", "assignee": "Assignee", "files": "Files & media", "customer_action_needed": "Customer Action Needed", "blocked_reason": "Blocked Reason", "client_facing_notes": "Client-Facing Notes", "sort_order": "Sort Order"}
INVOICE_PROPS = {"no": "No", "project": "Project", "amount": "Fix cost", "paid": "Paid", "payment_status": "Payment Status", "due_date": "Due Date", "issued_on": "Issued on", "stripe_invoice_id": "Stripe Invoice ID", "stripe_invoice_url": "Stripe Invoice URL", "type": "Type", "issued_to": "Issued to", "source": "Source", "files": "Files"}
MEETING_PROPS = {"name": "Name", "project": "Project", "date_time": "Date & Time", "meeting_link": "Meeting Link", "status": "Status", "client_visible": "Client Visible", "meeting_summary": "Meeting Summary", "notes": "Notes", "participant": "Participant"}
DELIVERABLE_PROPS = {"name": "Name", "project": "Project", "status": "Status", "due_date": "Due Date", "delivered_date": "Delivered Date", "description": "Description", "files": "Files", "client_visible": "Client Visible"}
UPDATE_PROPS = {"name": "Name", "project": "Project", "date": "Date", "content": "Content", "type": "Type", "client_visible": "Client Visible", "author": "Author", "pinned": "Pinned", "excerpt": "Excerpt", "cta_label": "CTA Label", "cta_url": "CTA URL"}
PORTAL_CONFIG_PROPS = {"name": "Name", "project": "Project", "client": "Client", "portal_title": "Portal Title", "portal_intro": "Portal Intro", "contact_email": "Contact Email", "show_tasks": "Show Tasks", "show_meetings": "Show Meetings", "show_invoices": "Show Invoices", "show_deliverables": "Show Deliverables", "show_roadmap": "Show Roadmap", "show_documents": "Show Documents", "show_feedback": "Show Feedback", "cta_label": "CTA Label", "cta_url": "CTA URL", "support_contact": "Support Contact", "status": "Status", "default_landing_tab": "Default Landing Tab", "support_sla_text": "Support SLA Text", "escalation_contact": "Escalation Contact", "welcome_checklist_enabled": "Welcome Checklist Enabled"}
REQUEST_PROPS = {"name": "Name", "project": "Project", "client": "Client", "type": "Type", "priority": "Priority", "description": "Description", "status": "Status", "date": "Date", "assigned_to": "Assigned To", "requester_email": "Requester Email", "client_facing_status": "Client-Facing Status", "target_response_date": "Target Response Date", "resolved_date": "Resolved Date"}
PORTAL_USER_PROPS = {"name": "Name", "email": "Email", "status": "Status", "role": "Role", "client": "Client", "accessible_projects": "Accessible Projects", "default_project": "Default Project", "access_scope": "Access Scope", "last_login_at": "Last Login At", "notes": "Notes"}
PORTAL_DOCUMENT_PROPS = {"name": "Name", "project": "Project", "client": "Client", "category": "Category", "client_facing_title": "Client-Facing Title", "summary": "Summary", "files": "Files", "external_url": "External URL", "client_visible": "Client Visible", "sort_order": "Sort Order", "status": "Status", "published_at": "Published At", "source_system": "Source System", "external_id": "External ID", "owner": "Owner", "source_last_synced_at": "Source Last Synced At", "last_reviewed_at": "Last Reviewed At", "needs_review": "Needs Review", "deliverable_source": "Deliverable Source", "proposal_source": "Proposal Source", "contract_source": "Contract Source"}
MILESTONE_PROPS = {"name": "Name", "project": "Project", "client": "Client", "status": "Status", "milestone_type": "Milestone Type", "target_date": "Target Date", "completed_date": "Completed Date", "summary": "Summary", "owner": "Owner", "client_visible": "Client Visible", "sort_order": "Sort Order", "customer_action_needed": "Customer Action Needed", "cta_label": "CTA Label", "cta_url": "CTA URL"}


class NotionCache:
    def __init__(self, ttl=300):
        self._c = {}
        self.ttl = ttl

    def _key(self, *args):
        return hashlib.md5(json.dumps(args, sort_keys=True, default=str).encode()).hexdigest()

    def get(self, *args):
        k = self._key(*args)
        if k in self._c:
            data, ts = self._c[k]
            if time.time() - ts < self.ttl:
                return data
            del self._c[k]
        return None

    def set(self, data, *args):
        self._c[self._key(*args)] = (data, time.time())

    def invalidate(self):
        self._c.clear()


cache = NotionCache(ttl=300)


async def notion_query(db_key, filter_obj=None, sorts=None, use_cache=True):
    if not NOTION_API_KEY:
        return []
    cache_args = ("query", db_key, filter_obj, sorts)
    if use_cache:
        cached = cache.get(*cache_args)
        if cached is not None:
            return cached
    db_id = NOTION_DB.get(db_key)
    if not db_id:
        return []
    url = f"{NOTION_BASE}/databases/{db_id}/query"
    headers = {"Authorization": f"Bearer {NOTION_API_KEY}", "Notion-Version": NOTION_VERSION, "Content-Type": "application/json"}
    body = {}
    if filter_obj:
        body["filter"] = filter_obj
    if sorts:
        body["sorts"] = sorts
    all_results = []
    has_more = True
    start_cursor = None
    async with httpx.AsyncClient(timeout=30) as client:
        while has_more:
            if start_cursor:
                body["start_cursor"] = start_cursor
            resp = await client.post(url, headers=headers, json=body)
            if resp.status_code != 200:
                print(f"Notion API error ({db_key}): {resp.status_code} - {resp.text[:200]}")
                break
            data = resp.json()
            all_results.extend(data.get("results", []))
            has_more = data.get("has_more", False)
            start_cursor = data.get("next_cursor")
    if use_cache and all_results:
        cache.set(all_results, *cache_args)
    return all_results


async def notion_create_page(db_key, properties):
    if not NOTION_API_KEY:
        raise HTTPException(status_code=503, detail="Notion API key not configured")
    db_id = NOTION_DB.get(db_key)
    if not db_id:
        raise HTTPException(status_code=400, detail=f"Unknown database: {db_key}")
    headers = {"Authorization": f"Bearer {NOTION_API_KEY}", "Notion-Version": NOTION_VERSION, "Content-Type": "application/json"}
    body = {"parent": {"database_id": db_id}, "properties": properties}
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(f"{NOTION_BASE}/pages", headers=headers, json=body)
        if resp.status_code not in (200, 201):
            print(f"Notion create error: {resp.status_code} - {resp.text[:200]}")
            raise HTTPException(status_code=500, detail="Failed to create record in Notion")
        cache.invalidate()
        return resp.json()


def create_token(user_id: str, email: str, role: str, client_notion_id: str = None):
    payload = {
        "sub": user_id, "email": email, "role": role,
        "client_notion_id": client_notion_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return {
            "id": str(user["_id"]),
            "email": user["email"],
            "role": user.get("role", "client"),
            "name": user.get("name", ""),
            "client_notion_id": user.get("client_notion_id"),
            "project_ids": user.get("project_ids", []),
            "default_project_id": user.get("default_project_id"),
            "access_scope": user.get("access_scope"),
            "portal_user_notion_id": user.get("portal_user_notion_id"),
            "notion_role": user.get("notion_role"),
        }
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_admin(user):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")


async def get_accessible_project(project_id: str, user, prop_map=None):
    projects = await get_user_projects(user, prop_map=prop_map or PROJECT_PROPS)
    for project in projects:
        if project.get("id") == project_id:
            return project

    raise HTTPException(status_code=404, detail="Project not found")


def get_date_start(value):
    if isinstance(value, dict):
        return value.get("start")
    return value


def first_relation_id(values):
    if isinstance(values, list) and values:
        return values[0]
    return None


def normalize_app_role(notion_role: Optional[str], admin_override: bool = False):
    if admin_override:
        return "admin"
    if notion_role in ("Admin", "Internal"):
        return "admin"
    return "client"


def display_document_title(document):
    return document.get("client_facing_title") or document.get("name") or "Untitled Document"


def sort_value(value, fallback=""):
    if value is None:
        return fallback
    return value


async def notion_update_page(page_id, properties):
    if not NOTION_API_KEY:
        return
    headers = {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }
    body = {"properties": properties}
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.patch(f"{NOTION_BASE}/pages/{page_id}", headers=headers, json=body)
        if resp.status_code not in (200, 201):
            print(f"Notion update error ({page_id}): {resp.status_code} - {resp.text[:200]}")
        else:
            cache.invalidate()


async def resolve_identity(email: str):
    admin_entry = None
    admin_override = email == ADMIN_EMAIL
    if not admin_override:
        admin_entry = await db.portal_access.find_one({"email": email})
        admin_override = bool(admin_entry and admin_entry.get("role") == "admin")

    portal_users = await notion_query("portal_users", {"property": "Email", "email": {"equals": email}}, use_cache=False)
    if portal_users:
        portal_user = parse_page(portal_users[0], PORTAL_USER_PROPS)
        status = portal_user.get("status") or "Active"
        if status == "Disabled" and not admin_override:
            raise HTTPException(status_code=403, detail="Your portal access is disabled. Please contact support.")
        if status not in ("Active", "Invited", "Disabled"):
            raise HTTPException(status_code=403, detail="Your portal access is not currently active. Please contact support.")

        client_notion_id = first_relation_id(portal_user.get("client"))
        access_scope = portal_user.get("access_scope") or "Project-specific"
        project_ids = portal_user.get("accessible_projects") or []

        if client_notion_id and (access_scope == "Client-wide" or not project_ids):
            projects = await notion_query("project", {"property": "Client", "relation": {"contains": client_notion_id}})
            project_ids = [page.get("id") for page in projects]

        default_project_id = first_relation_id(portal_user.get("default_project")) or (project_ids[0] if project_ids else None)
        role = normalize_app_role(portal_user.get("role"), admin_override=admin_override)
        name = portal_user.get("name") or email.split("@")[0]

        return {
            "role": role,
            "notion_role": portal_user.get("role"),
            "name": name,
            "client_notion_id": client_notion_id,
            "project_ids": project_ids,
            "default_project_id": default_project_id,
            "access_scope": access_scope,
            "portal_user_notion_id": portal_users[0].get("id"),
            "source": "portal_user",
        }

    if admin_override:
        return {
            "role": "admin",
            "notion_role": "Admin",
            "name": (admin_entry or {}).get("name") or "Erick Sixto",
            "client_notion_id": None,
            "project_ids": [],
            "default_project_id": None,
            "access_scope": "Admin",
            "portal_user_notion_id": None,
            "source": "admin_access",
        }

    clients = await notion_query("client", {"property": "Email", "rich_text": {"equals": email}}, use_cache=False)
    if not clients:
        raise HTTPException(status_code=404, detail="No account found with this email address")

    client_data = parse_page(clients[0], CLIENT_PROPS)
    if client_data.get("status") and client_data["status"] not in ("Active",):
        raise HTTPException(status_code=403, detail="Your account is not currently active. Please contact support.")

    project_pages = await notion_query("project", {"property": "Client", "relation": {"contains": clients[0].get("id")}})
    project_ids = [page.get("id") for page in project_pages]

    return {
        "role": "client",
        "notion_role": "Client",
        "name": client_data.get("contact_person") or client_data.get("name") or email.split("@")[0],
        "client_notion_id": clients[0].get("id"),
        "project_ids": project_ids,
        "default_project_id": project_ids[0] if project_ids else None,
        "access_scope": "Client-wide",
        "portal_user_notion_id": None,
        "source": "legacy_client",
    }


async def get_user_projects(user, prop_map=None):
    if user.get("role") == "admin":
        pages = await notion_query("project")
    elif user.get("client_notion_id"):
        pages = await notion_query("project", {"property": "Client", "relation": {"contains": user["client_notion_id"]}})
    else:
        pages = await notion_query("project")

    projects = [parse_page(page, prop_map or PROJECT_PROPS) for page in pages]
    if user.get("role") == "admin":
        return projects

    allowed_ids = set(user.get("project_ids") or [])
    if not allowed_ids:
        return []
    return [project for project in projects if project.get("id") in allowed_ids]


def is_open_task(task):
    return task.get("status") not in ("Done", "Won't Do")


@asynccontextmanager
async def lifespan(app: FastAPI):
    global mongo_client, db
    mongo_client = AsyncIOMotorClient(MONGO_URL)
    db = mongo_client[DB_NAME]
    await db.users.create_index("email", unique=True)
    await db.magic_codes.create_index("expires_at", expireAfterSeconds=0)
    admin = await db.users.find_one({"email": ADMIN_EMAIL})
    if not admin:
        await db.users.insert_one({"email": ADMIN_EMAIL, "name": "Erick Sixto", "role": "admin", "created_at": datetime.now(timezone.utc)})
    yield
    mongo_client.close()


app = FastAPI(title="Sixto Portal API", lifespan=lifespan)

origins = [
    os.environ.get("FRONTEND_URL", "http://localhost:3000"),
    "http://localhost:3000",
    "http://localhost:8001",
]
app_url = os.environ.get("APP_URL", "")
if app_url:
    origins.append(app_url)
# Also allow the same domain without/with trailing slash
frontend_url = os.environ.get("FRONTEND_URL", "")
if frontend_url:
    origins.append(frontend_url.rstrip("/"))

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])


class MagicLinkRequest(BaseModel):
    email: str

class VerifyCodeRequest(BaseModel):
    email: str
    code: str

class SubmitRequestModel(BaseModel):
    name: str
    type: str
    priority: str
    description: str

class AccessEmailModel(BaseModel):
    email: str
    role: str = "admin"
    name: str = ""


@app.get("/api/health")
async def health():
    return {"status": "ok", "notion": "connected" if NOTION_API_KEY else "not_configured", "ts": datetime.now(timezone.utc).isoformat()}


@app.post("/api/auth/request-magic-link")
async def request_magic_link(req: MagicLinkRequest):
    email = req.email.strip().lower()
    code = secrets.token_hex(3).upper()[:6]
    identity = await resolve_identity(email)
    await db.magic_codes.insert_one({
        "email": email,
        "code": code,
        "role": identity["role"],
        "notion_role": identity.get("notion_role"),
        "client_notion_id": identity.get("client_notion_id"),
        "portal_user_notion_id": identity.get("portal_user_notion_id"),
        "client_name": identity.get("name", ""),
        "project_ids": identity.get("project_ids", []),
        "default_project_id": identity.get("default_project_id"),
        "access_scope": identity.get("access_scope"),
        "identity_source": identity.get("source"),
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
        "used": False,
    })
    response = {"success": True, "message": "Magic link code generated. Check your email."}
    if AUTH_DEBUG_CODES:
        response["mock_code"] = code
    return response


@app.post("/api/auth/verify-magic-link")
async def verify_magic_link(req: VerifyCodeRequest, response: Response):
    email = req.email.strip().lower()
    code = req.code.strip().upper()

    magic = await db.magic_codes.find_one({"email": email, "code": code, "used": False, "expires_at": {"$gt": datetime.now(timezone.utc)}})
    if not magic:
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    await db.magic_codes.update_one({"_id": magic["_id"]}, {"$set": {"used": True}})

    user = await db.users.find_one({"email": email})
    determined_role = magic.get("role", "client")
    resolved_client_notion_id = magic["client_notion_id"] if "client_notion_id" in magic else (user.get("client_notion_id") if user else None)
    resolved_project_ids = magic["project_ids"] if "project_ids" in magic else ((user.get("project_ids") if user else []) or [])
    resolved_default_project_id = magic["default_project_id"] if "default_project_id" in magic else (user.get("default_project_id") if user else None)
    resolved_access_scope = magic["access_scope"] if "access_scope" in magic else (user.get("access_scope") if user else None)
    resolved_portal_user_notion_id = magic["portal_user_notion_id"] if "portal_user_notion_id" in magic else (user.get("portal_user_notion_id") if user else None)
    resolved_notion_role = magic["notion_role"] if "notion_role" in magic else (user.get("notion_role") if user else None)

    if not user:
        user_data = {
            "email": email,
            "role": determined_role,
            "name": magic.get("client_name", email.split("@")[0]),
            "client_notion_id": resolved_client_notion_id,
            "project_ids": resolved_project_ids,
            "default_project_id": resolved_default_project_id,
            "access_scope": resolved_access_scope,
            "portal_user_notion_id": resolved_portal_user_notion_id,
            "notion_role": resolved_notion_role,
            "created_at": datetime.now(timezone.utc),
        }
        result = await db.users.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        user = user_data
    else:
        updates = {}
        if user.get("role") != determined_role:
            updates["role"] = determined_role
        if user.get("client_notion_id") != resolved_client_notion_id:
            updates["client_notion_id"] = resolved_client_notion_id
        if user.get("project_ids", []) != resolved_project_ids:
            updates["project_ids"] = resolved_project_ids
        if user.get("default_project_id") != resolved_default_project_id:
            updates["default_project_id"] = resolved_default_project_id
        if user.get("access_scope") != resolved_access_scope:
            updates["access_scope"] = resolved_access_scope
        if user.get("portal_user_notion_id") != resolved_portal_user_notion_id:
            updates["portal_user_notion_id"] = resolved_portal_user_notion_id
        if user.get("notion_role") != resolved_notion_role:
            updates["notion_role"] = resolved_notion_role
        if updates:
            await db.users.update_one({"_id": user["_id"]}, {"$set": updates})
            user.update(updates)

    if user.get("portal_user_notion_id"):
        try:
            await notion_update_page(user["portal_user_notion_id"], {
                "Last Login At": {"date": {"start": datetime.now(timezone.utc).isoformat()}},
            })
        except Exception as exc:
            print(f"Failed to update portal user last login: {exc}")

    user_id = str(user["_id"])
    token = create_token(user_id, email, determined_role, user.get("client_notion_id"))

    response.set_cookie(key="access_token", value=token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")

    return {
        "success": True,
        "user": {
            "id": user_id,
            "email": email,
            "name": user.get("name", ""),
            "role": determined_role,
            "project_ids": user.get("project_ids", []),
            "client_notion_id": user.get("client_notion_id"),
            "default_project_id": user.get("default_project_id"),
            "access_scope": user.get("access_scope"),
            "portal_user_notion_id": user.get("portal_user_notion_id"),
            "notion_role": user.get("notion_role"),
        },
        "token": token,
    }


@app.get("/api/auth/me")
async def get_me(request: Request):
    return await get_current_user(request)


@app.post("/api/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"success": True}


@app.get("/api/portal/projects")
async def get_portal_projects(request: Request):
    user = await get_current_user(request)
    projects = await get_user_projects(user)
    default_project_id = user.get("default_project_id")
    if default_project_id:
        projects.sort(key=lambda project: (project.get("id") != default_project_id, sort_value(project.get("name"), "~")))
    return projects


@app.get("/api/portal/project/{project_id}/config")
async def get_portal_config(project_id: str, request: Request):
    user = await get_current_user(request)
    await get_accessible_project(project_id, user)
    configs = await notion_query("portal_config", {"property": "Project", "relation": {"contains": project_id}})
    if configs:
        return parse_page(configs[0], PORTAL_CONFIG_PROPS)
    return {"id": None, "portal_title": "Project Portal", "portal_intro": "Welcome to your project portal",
            "show_tasks": True, "show_meetings": True, "show_invoices": True, "show_deliverables": True,
            "show_roadmap": True, "show_documents": True, "show_feedback": True, "default_landing_tab": "Overview"}


@app.get("/api/portal/project/{project_id}/dashboard")
async def get_dashboard(project_id: str, request: Request):
    user = await get_current_user(request)
    project = await get_accessible_project(project_id, user)

    tasks_filter = {"property": "Project", "relation": {"contains": project_id}}
    deliverables_filter = {"property": "Project", "relation": {"contains": project_id}}
    if user["role"] != "admin":
        tasks_filter = {"and": [
            {"property": "Project", "relation": {"contains": project_id}},
            {"property": "Client Visible", "checkbox": {"equals": True}},
        ]}
        deliverables_filter = {"and": [
            {"property": "Project", "relation": {"contains": project_id}},
            {"property": "Client Visible", "checkbox": {"equals": True}},
        ]}
    milestones_filter = {"property": "Project", "relation": {"contains": project_id}}
    if user["role"] != "admin":
        milestones_filter = {"and": [
            {"property": "Project", "relation": {"contains": project_id}},
            {"property": "Client Visible", "checkbox": {"equals": True}},
        ]}

    tasks = await notion_query("task", tasks_filter, sorts=[{"property": "Sort Order", "direction": "ascending"}, {"property": "Due Date", "direction": "ascending"}])
    task_list = [parse_page(t, TASK_PROPS) for t in tasks]
    total_tasks = len(task_list)
    completed_tasks = len([t for t in task_list if t.get("status") == "Done"])
    open_tasks = [t for t in task_list if is_open_task(t)]
    blocked_tasks = len([t for t in open_tasks if t.get("status") == "Blocked"])
    client_action_tasks = len([t for t in open_tasks if t.get("customer_action_needed")])
    today_iso = datetime.now(timezone.utc).date().isoformat()
    overdue_tasks = len([
        t for t in open_tasks
        if get_date_start(t.get("due_date")) and get_date_start(t.get("due_date"))[:10] < today_iso
    ])
    next_due_task = next((
        t for t in open_tasks
        if get_date_start(t.get("due_date")) and get_date_start(t.get("due_date"))[:10] >= today_iso
    ), None)

    deliverables = await notion_query("deliverables", deliverables_filter)
    del_list = [parse_page(d, DELIVERABLE_PROPS) for d in deliverables]
    total_del = len(del_list)
    delivered = len([d for d in del_list if d.get("status") in ("Delivered", "Accepted")])

    milestones_raw = await notion_query("milestones", milestones_filter, sorts=[{"property": "Sort Order", "direction": "ascending"}, {"property": "Target Date", "direction": "ascending"}])
    milestone_list = [parse_page(m, MILESTONE_PROPS) for m in milestones_raw]
    total_milestones = len(milestone_list)
    completed_milestones = len([m for m in milestone_list if m.get("status") == "Completed"])
    at_risk_milestones = len([m for m in milestone_list if m.get("status") == "At Risk"])
    next_milestone = next((
        m for m in milestone_list
        if m.get("status") != "Completed" and get_date_start(m.get("target_date")) and get_date_start(m.get("target_date"))[:10] >= today_iso
    ), None)
    client_action_milestones = len([m for m in milestone_list if m.get("customer_action_needed") and m.get("status") != "Completed"])

    updates = await notion_query("updates", {"and": [
        {"property": "Project", "relation": {"contains": project_id}},
        {"property": "Client Visible", "checkbox": {"equals": True}},
    ]}, sorts=[{"property": "Date", "direction": "descending"}])
    recent = [parse_page(u, UPDATE_PROPS) for u in updates[:5]]

    meetings_raw = await notion_query("meetings", {"and": [
        {"property": "Project", "relation": {"contains": project_id}},
        {"property": "Client Visible", "checkbox": {"equals": True}},
    ]}, sorts=[{"property": "Date & Time", "direction": "ascending"}])
    now_iso = datetime.now(timezone.utc).isoformat()
    upcoming_meetings = []
    for m in meetings_raw:
        parsed_m = parse_page(m, MEETING_PROPS)
        dt = parsed_m.get("date_time")
        if dt and isinstance(dt, dict) and dt.get("start") and dt["start"] >= now_iso and parsed_m.get("status") not in ("Cancelled", "Completed"):
            upcoming_meetings.append(parsed_m)
    upcoming_meetings = upcoming_meetings[:3]
    latest_update = recent[0] if recent else None

    return {
        "project": project, "recent_updates": recent, "upcoming_meetings": upcoming_meetings,
        "metrics": {"tasks_completed": completed_tasks, "tasks_total": total_tasks,
                     "deliverables_delivered": delivered, "deliverables_total": total_del,
                     "milestones_completed": completed_milestones, "milestones_total": total_milestones},
        "attention": {"open_tasks": len(open_tasks), "blocked_tasks": blocked_tasks, "overdue_tasks": overdue_tasks,
                      "at_risk_milestones": at_risk_milestones, "client_action_items": client_action_tasks + client_action_milestones},
        "highlights": {
            "next_due_task": next_due_task,
            "next_meeting": upcoming_meetings[0] if upcoming_meetings else None,
            "latest_update": latest_update,
            "next_milestone": next_milestone,
        },
    }


@app.get("/api/portal/project/{project_id}/tasks")
async def get_tasks(project_id: str, request: Request):
    user = await get_current_user(request)
    await get_accessible_project(project_id, user)
    f = {"and": [{"property": "Project", "relation": {"contains": project_id}}, {"property": "Client Visible", "checkbox": {"equals": True}}]}
    if user["role"] == "admin":
        f = {"property": "Project", "relation": {"contains": project_id}}
    return [parse_page(p, TASK_PROPS) for p in await notion_query("task", f, sorts=[{"property": "Sort Order", "direction": "ascending"}, {"property": "Due Date", "direction": "ascending"}])]


@app.get("/api/portal/project/{project_id}/deliverables")
async def get_deliverables(project_id: str, request: Request):
    user = await get_current_user(request)
    await get_accessible_project(project_id, user)
    f = {"and": [{"property": "Project", "relation": {"contains": project_id}}, {"property": "Client Visible", "checkbox": {"equals": True}}]}
    if user["role"] == "admin":
        f = {"property": "Project", "relation": {"contains": project_id}}
    return [parse_page(p, DELIVERABLE_PROPS) for p in await notion_query("deliverables", f)]


@app.get("/api/portal/project/{project_id}/billing")
async def get_billing(project_id: str, request: Request):
    user = await get_current_user(request)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Billing is only available in the admin dashboard")
    await get_accessible_project(project_id, user)
    pages = await notion_query("invoice", {"property": "Project", "relation": {"contains": project_id}})
    invoices = [parse_page(p, INVOICE_PROPS) for p in pages]
    total_billed = sum(i.get("amount") or 0 for i in invoices)
    total_paid = sum(i.get("amount") or 0 for i in invoices if i.get("payment_status") == "Paid" or (i.get("paid") and not i.get("payment_status")))
    return {"invoices": invoices, "summary": {"total_billed": total_billed, "total_paid": total_paid, "outstanding": total_billed - total_paid}}


@app.get("/api/portal/project/{project_id}/updates")
async def get_updates(project_id: str, request: Request):
    user = await get_current_user(request)
    await get_accessible_project(project_id, user)
    f = {"and": [{"property": "Project", "relation": {"contains": project_id}}, {"property": "Client Visible", "checkbox": {"equals": True}}]}
    if user["role"] == "admin":
        f = {"property": "Project", "relation": {"contains": project_id}}
    return [parse_page(p, UPDATE_PROPS) for p in await notion_query("updates", f, sorts=[{"property": "Date", "direction": "descending"}])]


@app.get("/api/portal/project/{project_id}/meetings")
async def get_meetings(project_id: str, request: Request):
    user = await get_current_user(request)
    await get_accessible_project(project_id, user)
    f = {"and": [{"property": "Project", "relation": {"contains": project_id}}, {"property": "Client Visible", "checkbox": {"equals": True}}]}
    if user["role"] == "admin":
        f = {"property": "Project", "relation": {"contains": project_id}}
    return [parse_page(p, MEETING_PROPS) for p in await notion_query("meetings", f, sorts=[{"property": "Date & Time", "direction": "descending"}])]


@app.get("/api/portal/project/{project_id}/documents")
async def get_documents(project_id: str, request: Request):
    user = await get_current_user(request)
    await get_accessible_project(project_id, user)
    doc_filter = {"property": "Project", "relation": {"contains": project_id}}
    if user["role"] != "admin":
        doc_filter = {"and": [
            {"property": "Project", "relation": {"contains": project_id}},
            {"property": "Client Visible", "checkbox": {"equals": True}},
            {"property": "Status", "select": {"equals": "Published"}},
        ]}

    documents = [parse_page(page, PORTAL_DOCUMENT_PROPS) for page in await notion_query(
        "portal_documents",
        doc_filter,
        sorts=[{"property": "Sort Order", "direction": "ascending"}, {"property": "Published At", "direction": "descending"}],
    )]

    for document in documents:
        document["title"] = display_document_title(document)
        document["primary_url"] = document.get("external_url") or ((document.get("files") or [{}])[0].get("url") if document.get("files") else None)

    return {"documents": documents}


@app.get("/api/portal/project/{project_id}/roadmap")
async def get_roadmap(project_id: str, request: Request):
    user = await get_current_user(request)
    await get_accessible_project(project_id, user)
    f = {"property": "Project", "relation": {"contains": project_id}}
    if user["role"] != "admin":
        f = {"and": [{"property": "Project", "relation": {"contains": project_id}}, {"property": "Client Visible", "checkbox": {"equals": True}}]}
    return [parse_page(p, MILESTONE_PROPS) for p in await notion_query("milestones", f, sorts=[{"property": "Sort Order", "direction": "ascending"}, {"property": "Target Date", "direction": "ascending"}])]


@app.post("/api/portal/project/{project_id}/requests")
async def submit_request(project_id: str, req: SubmitRequestModel, request: Request):
    user = await get_current_user(request)
    await get_accessible_project(project_id, user)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    properties = {
        "Name": {"title": [{"text": {"content": req.name}}]},
        "Type": {"select": {"name": req.type}},
        "Priority": {"select": {"name": req.priority}},
        "Description": {"rich_text": [{"text": {"content": req.description}}]},
        "Status": {"select": {"name": "New"}},
        "Client-Facing Status": {"select": {"name": "Received"}},
        "Date": {"date": {"start": today}},
    }
    if project_id:
        properties["Project"] = {"relation": [{"id": project_id}]}
    if user.get("client_notion_id"):
        properties["Client"] = {"relation": [{"id": user["client_notion_id"]}]}
    if user.get("email"):
        properties["Requester Email"] = {"email": user["email"]}
    await notion_create_page("requests", properties)
    return {"success": True, "message": "Request submitted successfully"}


@app.get("/api/admin/projects")
async def admin_projects(request: Request):
    user = await get_current_user(request)
    require_admin(user)
    pages = await notion_query("project")
    projects = [parse_page(p, PROJECT_PROPS_ADMIN) for p in pages]
    clients_pages = await notion_query("client")
    client_map = {c.get("id"): parse_page(c, CLIENT_PROPS).get("name", "") for c in clients_pages}
    for proj in projects:
        cids = proj.get("client") or []
        proj["client_name"] = client_map.get(cids[0], "") if cids else ""
    return projects


@app.get("/api/admin/clients")
async def admin_clients(request: Request):
    user = await get_current_user(request)
    require_admin(user)
    return [parse_page(p, CLIENT_PROPS) for p in await notion_query("client")]


@app.get("/api/admin/billing")
async def admin_billing(request: Request):
    user = await get_current_user(request)
    require_admin(user)
    pages = await notion_query("invoice")
    invoices = [parse_page(p, INVOICE_PROPS) for p in pages]
    outstanding = [i for i in invoices if i.get("payment_status") in ("Sent", "Overdue") or (not i.get("paid") and i.get("amount") and i.get("payment_status") not in ("Paid", "Draft", "Cancelled"))]
    paid = [i for i in invoices if i.get("payment_status") == "Paid" or (i.get("paid") and i.get("payment_status") not in ("Sent", "Overdue"))]
    total = sum(i.get("amount") or 0 for i in invoices)
    total_paid = sum(i.get("amount") or 0 for i in paid)
    return {"invoices": invoices, "outstanding": outstanding, "recent_paid": paid,
            "summary": {"total_revenue": total, "total_paid": total_paid, "outstanding": total - total_paid}}


@app.get("/api/admin/portals")
async def admin_portals(request: Request):
    user = await get_current_user(request)
    require_admin(user)
    return [parse_page(p, PORTAL_CONFIG_PROPS) for p in await notion_query("portal_config")]


@app.post("/api/cache/invalidate")
async def invalidate_cache(request: Request):
    user = await get_current_user(request)
    require_admin(user)
    cache.invalidate()
    return {"success": True, "message": "Cache invalidated"}


@app.get("/api/admin/access")
async def get_access_list(request: Request):
    user = await get_current_user(request)
    require_admin(user)
    entries = []
    async for doc in db.portal_access.find({}, {"_id": 0}):
        entries.append(doc)
    # Include primary admin
    entries.insert(0, {"email": ADMIN_EMAIL, "role": "admin", "name": "Primary Admin", "protected": True})
    return entries


@app.post("/api/admin/access")
async def add_access(req: AccessEmailModel, request: Request):
    user = await get_current_user(request)
    require_admin(user)
    email = req.email.strip().lower()
    existing = await db.portal_access.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already in access list")
    await db.portal_access.insert_one({"email": email, "role": req.role, "name": req.name, "created_at": datetime.now(timezone.utc).isoformat()})
    return {"success": True}


@app.delete("/api/admin/access/{email}")
async def remove_access(email: str, request: Request):
    user = await get_current_user(request)
    require_admin(user)
    email = email.strip().lower()
    if email == ADMIN_EMAIL:
        raise HTTPException(status_code=400, detail="Cannot remove primary admin")
    result = await db.portal_access.delete_one({"email": email})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Email not found")
    return {"success": True}
