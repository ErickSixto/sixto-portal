"""
Backend API Tests for Sixto Portal - Post-Refactor
Tests: Auth flow, Projects list, Project detail, Billing removal from client view
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://erick-consulting.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "sixto.developer@gmail.com"
CLIENT_EMAIL = "arman@bluegateinc.com"


class TestHealthAndAuth:
    """Health check and authentication tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint returns ok status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["notion"] == "connected"
        print(f"✓ Health check passed: {data}")
    
    def test_admin_magic_link_request(self):
        """Test admin can request magic link"""
        response = requests.post(
            f"{BASE_URL}/api/auth/request-magic-link",
            json={"email": ADMIN_EMAIL}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "mock_code" in data  # MOCKED - code returned in response
        print(f"✓ Admin magic link request passed, mock_code: {data['mock_code']}")
        return data["mock_code"]
    
    def test_client_magic_link_request(self):
        """Test client can request magic link"""
        response = requests.post(
            f"{BASE_URL}/api/auth/request-magic-link",
            json={"email": CLIENT_EMAIL}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "mock_code" in data
        print(f"✓ Client magic link request passed, mock_code: {data['mock_code']}")
        return data["mock_code"]
    
    def test_invalid_email_magic_link(self):
        """Test invalid email returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/auth/request-magic-link",
            json={"email": "nonexistent@example.com"}
        )
        assert response.status_code == 404
        print("✓ Invalid email correctly returns 404")
    
    def test_admin_verify_magic_link(self):
        """Test admin can verify magic link and get token"""
        # First request code
        req_response = requests.post(
            f"{BASE_URL}/api/auth/request-magic-link",
            json={"email": ADMIN_EMAIL}
        )
        mock_code = req_response.json()["mock_code"]
        
        # Verify code
        response = requests.post(
            f"{BASE_URL}/api/auth/verify-magic-link",
            json={"email": ADMIN_EMAIL, "code": mock_code}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert data["user"]["role"] == "admin"
        assert data["user"]["email"] == ADMIN_EMAIL
        assert "project_ids" in data["user"]
        assert "default_project_id" in data["user"]
        assert data["user"]["access_scope"] == "Admin"
        print(f"✓ Admin verify passed, role: {data['user']['role']}")
        return data["token"]
    
    def test_client_verify_magic_link(self):
        """Test client can verify magic link and get token"""
        # First request code
        req_response = requests.post(
            f"{BASE_URL}/api/auth/request-magic-link",
            json={"email": CLIENT_EMAIL}
        )
        mock_code = req_response.json()["mock_code"]
        
        # Verify code
        response = requests.post(
            f"{BASE_URL}/api/auth/verify-magic-link",
            json={"email": CLIENT_EMAIL, "code": mock_code}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "token" in data
        assert data["user"]["role"] == "client"
        assert data["user"]["email"] == CLIENT_EMAIL
        assert len(data["user"]["project_ids"]) >= 1
        assert data["user"]["default_project_id"] in data["user"]["project_ids"]
        assert data["user"]["access_scope"] in ("Project-specific", "Client-wide")
        print(f"✓ Client verify passed, role: {data['user']['role']}")
        return data["token"]


@pytest.fixture
def admin_token():
    """Get admin authentication token"""
    req_response = requests.post(
        f"{BASE_URL}/api/auth/request-magic-link",
        json={"email": ADMIN_EMAIL}
    )
    mock_code = req_response.json()["mock_code"]
    response = requests.post(
        f"{BASE_URL}/api/auth/verify-magic-link",
        json={"email": ADMIN_EMAIL, "code": mock_code}
    )
    return response.json()["token"]


@pytest.fixture
def client_token():
    """Get client authentication token"""
    req_response = requests.post(
        f"{BASE_URL}/api/auth/request-magic-link",
        json={"email": CLIENT_EMAIL}
    )
    mock_code = req_response.json()["mock_code"]
    response = requests.post(
        f"{BASE_URL}/api/auth/verify-magic-link",
        json={"email": CLIENT_EMAIL, "code": mock_code}
    )
    return response.json()["token"]


class TestPortalProjects:
    """Test /api/portal/projects endpoint - Projects list"""
    
    def test_admin_sees_all_projects(self, admin_token):
        """Admin should see all projects"""
        response = requests.get(
            f"{BASE_URL}/api/portal/projects",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        projects = response.json()
        assert isinstance(projects, list)
        assert len(projects) >= 1  # Admin should see multiple projects
        print(f"✓ Admin sees {len(projects)} projects")
        
        # Verify NO estimated_amount in client-facing endpoint
        for project in projects:
            assert "estimated_amount" not in project, "estimated_amount should NOT be in portal/projects response"
            assert "id" in project
            assert "name" in project
            assert "status" in project
        print("✓ No billing data (estimated_amount) in portal/projects response")
    
    def test_client_sees_own_projects(self, client_token):
        """Client should see only their projects"""
        response = requests.get(
            f"{BASE_URL}/api/portal/projects",
            headers={"Authorization": f"Bearer {client_token}"}
        )
        assert response.status_code == 200
        projects = response.json()
        assert isinstance(projects, list)
        print(f"✓ Client sees {len(projects)} project(s)")
        
        # Verify NO estimated_amount
        for project in projects:
            assert "estimated_amount" not in project
        print("✓ No billing data in client's portal/projects response")
    
    def test_unauthenticated_access_blocked(self):
        """Unauthenticated access should be blocked"""
        response = requests.get(f"{BASE_URL}/api/portal/projects")
        assert response.status_code == 401
        print("✓ Unauthenticated access correctly blocked")


class TestProjectDashboard:
    """Test /api/portal/project/{id}/dashboard - NO billing data"""
    
    def test_dashboard_no_billing_metrics(self, admin_token):
        """Dashboard should NOT contain billing metrics"""
        # First get a project ID
        projects_response = requests.get(
            f"{BASE_URL}/api/portal/projects",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        projects = projects_response.json()
        assert len(projects) > 0, "Need at least one project to test"
        
        project_id = projects[0]["id"]
        
        # Get dashboard
        response = requests.get(
            f"{BASE_URL}/api/portal/project/{project_id}/dashboard",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "project" in data
        assert "metrics" in data
        assert "recent_updates" in data
        assert "upcoming_meetings" in data
        
        # CRITICAL: Verify NO billing data
        metrics = data["metrics"]
        assert "total_billed" not in metrics, "total_billed should NOT be in dashboard metrics"
        assert "total_paid" not in metrics, "total_paid should NOT be in dashboard metrics"
        assert "outstanding" not in metrics, "outstanding should NOT be in dashboard metrics"
        
        # Verify expected metrics ARE present
        assert "tasks_completed" in metrics
        assert "tasks_total" in metrics
        assert "deliverables_delivered" in metrics
        assert "deliverables_total" in metrics
        
        print(f"✓ Dashboard for project '{data['project']['name']}' has NO billing data")
        print(f"  Metrics: tasks={metrics['tasks_completed']}/{metrics['tasks_total']}, deliverables={metrics['deliverables_delivered']}/{metrics['deliverables_total']}")


class TestProjectTabs:
    """Test project detail tab endpoints"""
    
    def test_deliverables_endpoint(self, admin_token):
        """Test deliverables tab loads"""
        projects_response = requests.get(
            f"{BASE_URL}/api/portal/projects",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        project_id = projects_response.json()[0]["id"]
        
        response = requests.get(
            f"{BASE_URL}/api/portal/project/{project_id}/deliverables",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Deliverables endpoint returns {len(data)} items")
    
    def test_documents_endpoint(self, admin_token):
        """Test documents tab loads"""
        projects_response = requests.get(
            f"{BASE_URL}/api/portal/projects",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        project_id = projects_response.json()[0]["id"]
        
        response = requests.get(
            f"{BASE_URL}/api/portal/project/{project_id}/documents",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "documents" in data
        assert isinstance(data["documents"], list)
        print(f"✓ Documents endpoint returns {len(data['documents'])} document(s)")

    def test_roadmap_endpoint(self, admin_token):
        """Test roadmap tab loads"""
        projects_response = requests.get(
            f"{BASE_URL}/api/portal/projects",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        project_id = projects_response.json()[0]["id"]

        response = requests.get(
            f"{BASE_URL}/api/portal/project/{project_id}/roadmap",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Roadmap endpoint returns {len(data)} milestone(s)")
    
    def test_meetings_endpoint(self, admin_token):
        """Test meetings tab loads"""
        projects_response = requests.get(
            f"{BASE_URL}/api/portal/projects",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        project_id = projects_response.json()[0]["id"]
        
        response = requests.get(
            f"{BASE_URL}/api/portal/project/{project_id}/meetings",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Meetings endpoint returns {len(data)} items")
    
    def test_updates_endpoint(self, admin_token):
        """Test updates tab loads"""
        projects_response = requests.get(
            f"{BASE_URL}/api/portal/projects",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        project_id = projects_response.json()[0]["id"]
        
        response = requests.get(
            f"{BASE_URL}/api/portal/project/{project_id}/updates",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Updates endpoint returns {len(data)} items")


class TestAdminBilling:
    """Test admin billing endpoint still works"""
    
    def test_admin_billing_accessible(self, admin_token):
        """Admin should still have access to billing"""
        response = requests.get(
            f"{BASE_URL}/api/admin/billing",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "invoices" in data
        assert "summary" in data
        # Admin billing SHOULD have these
        assert "total_revenue" in data["summary"] or "total_paid" in data["summary"]
        print(f"✓ Admin billing endpoint works, {len(data['invoices'])} invoices")
    
    def test_client_cannot_access_admin_billing(self, client_token):
        """Client should NOT have access to admin billing"""
        response = requests.get(
            f"{BASE_URL}/api/admin/billing",
            headers={"Authorization": f"Bearer {client_token}"}
        )
        assert response.status_code == 403
        print("✓ Client correctly blocked from admin billing")


class TestLogout:
    """Test logout functionality"""
    
    def test_logout_endpoint(self, admin_token):
        """Test logout clears session"""
        response = requests.post(
            f"{BASE_URL}/api/auth/logout",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print("✓ Logout endpoint works")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
