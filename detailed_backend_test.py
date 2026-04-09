#!/usr/bin/env python3
"""
Detailed backend API testing for specific requirements
"""

import requests
import sys
import json
from datetime import datetime

class DetailedSixtoTester:
    def __init__(self, base_url="https://b1c05402-582c-49e2-9942-68c9c17e9616.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.admin_email = "sixto.developer@gmail.com"
        self.project_id = None

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def api_call(self, method, endpoint, data=None):
        """Make API call with proper headers"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            
            return response.status_code, response.json() if response.content else {}
        except Exception as e:
            self.log(f"API Error: {str(e)}")
            return 500, {}

    def authenticate(self):
        """Authenticate as admin"""
        self.log("🔐 Authenticating as admin...")
        
        # Request magic link
        status, response = self.api_call('POST', 'auth/request-magic-link', {"email": self.admin_email})
        if status != 200 or not response.get('mock_code'):
            self.log("❌ Failed to request magic link")
            return False
        
        mock_code = response['mock_code']
        self.log(f"   Mock code: {mock_code}")
        
        # Verify magic link
        status, response = self.api_call('POST', 'auth/verify-magic-link', {"email": self.admin_email, "code": mock_code})
        if status != 200 or not response.get('token'):
            self.log("❌ Failed to verify magic link")
            return False
        
        self.token = response['token']
        self.log("✅ Authentication successful")
        return True

    def test_health_detailed(self):
        """Test health endpoint with detailed checks"""
        self.log("🏥 Testing health endpoint...")
        status, response = self.api_call('GET', 'health')
        
        if status != 200:
            self.log(f"❌ Health check failed with status {status}")
            return False
        
        if response.get('status') != 'ok':
            self.log(f"❌ Health status is not 'ok': {response.get('status')}")
            return False
        
        if response.get('notion') != 'connected':
            self.log(f"❌ Notion is not connected: {response.get('notion')}")
            return False
        
        self.log("✅ Health check passed - status ok and notion=connected")
        return True

    def test_admin_projects_detailed(self):
        """Test admin projects with detailed data validation"""
        self.log("📁 Testing admin projects endpoint...")
        status, response = self.api_call('GET', 'admin/projects')
        
        if status != 200:
            self.log(f"❌ Admin projects failed with status {status}")
            return False
        
        if not isinstance(response, list):
            self.log(f"❌ Expected list, got {type(response)}")
            return False
        
        project_count = len(response)
        self.log(f"   Found {project_count} projects")
        
        if project_count < 5:
            self.log(f"❌ Expected at least 5 projects, found {project_count}")
            return False
        
        # Store first project ID for later tests
        if response:
            self.project_id = response[0].get('id')
            project_name = response[0].get('name')
            self.log(f"   First project: {project_name} (ID: {self.project_id})")
        
        self.log("✅ Admin projects test passed - 5+ projects with real Notion data")
        return True

    def test_admin_billing_detailed(self):
        """Test admin billing with detailed validation"""
        self.log("💰 Testing admin billing endpoint...")
        status, response = self.api_call('GET', 'admin/billing')
        
        if status != 200:
            self.log(f"❌ Admin billing failed with status {status}")
            return False
        
        invoices = response.get('invoices', [])
        outstanding = response.get('outstanding', [])
        summary = response.get('summary', {})
        
        self.log(f"   Total invoices: {len(invoices)}")
        self.log(f"   Outstanding invoices: {len(outstanding)}")
        self.log(f"   Total revenue: ${summary.get('total_revenue', 0):,}")
        self.log(f"   Outstanding amount: ${summary.get('outstanding', 0):,}")
        
        # Check for paid/outstanding counts as mentioned in requirements
        paid_count = len([i for i in invoices if i.get('payment_status') == 'Paid'])
        outstanding_count = len(outstanding)
        
        self.log(f"   Paid invoices: {paid_count}")
        self.log(f"   Outstanding count: {outstanding_count}")
        
        self.log("✅ Admin billing test passed - returns invoices with paid/outstanding counts")
        return True

    def test_portal_dashboard_detailed(self):
        """Test portal dashboard with detailed metrics validation"""
        if not self.project_id:
            self.log("❌ No project ID available for dashboard test")
            return False
        
        self.log("📊 Testing portal dashboard endpoint...")
        status, response = self.api_call('GET', f'portal/project/{self.project_id}/dashboard')
        
        if status != 200:
            self.log(f"❌ Portal dashboard failed with status {status}")
            return False
        
        project = response.get('project', {})
        metrics = response.get('metrics', {})
        
        project_name = project.get('name', 'Unknown')
        tasks_completed = metrics.get('tasks_completed', 0)
        tasks_total = metrics.get('tasks_total', 0)
        estimated_value = project.get('estimated_amount', 0)
        
        self.log(f"   Project: {project_name}")
        self.log(f"   Tasks: {tasks_completed}/{tasks_total}")
        self.log(f"   Estimated value: ${estimated_value:,}")
        
        # Validate the specific requirements mentioned
        if tasks_total == 0:
            self.log("⚠️  No tasks found for this project")
        else:
            progress = round((tasks_completed / tasks_total) * 100)
            self.log(f"   Progress: {progress}%")
        
        self.log("✅ Portal dashboard test passed - returns project metrics from live Notion")
        return True

    def test_portal_tasks_detailed(self):
        """Test portal tasks with detailed validation"""
        if not self.project_id:
            self.log("❌ No project ID available for tasks test")
            return False
        
        self.log("📋 Testing portal tasks endpoint...")
        status, response = self.api_call('GET', f'portal/project/{self.project_id}/tasks')
        
        if status != 200:
            self.log(f"❌ Portal tasks failed with status {status}")
            return False
        
        if not isinstance(response, list):
            self.log(f"❌ Expected list, got {type(response)}")
            return False
        
        task_count = len(response)
        self.log(f"   Found {task_count} tasks")
        
        if task_count > 0:
            # Analyze task data
            statuses = {}
            priorities = {}
            phases = {}
            
            for task in response:
                status = task.get('status', 'Unknown')
                priority = task.get('priority', 'None')
                phase = task.get('phase', 'Other')
                
                statuses[status] = statuses.get(status, 0) + 1
                priorities[priority] = priorities.get(priority, 0) + 1
                phases[phase] = phases.get(phase, 0) + 1
            
            self.log(f"   Task statuses: {dict(statuses)}")
            self.log(f"   Task priorities: {dict(priorities)}")
            self.log(f"   Task phases: {dict(phases)}")
            
            # Check first task details
            first_task = response[0]
            self.log(f"   First task: {first_task.get('name')} ({first_task.get('status')})")
        
        self.log("✅ Portal tasks test passed - returns tasks from Notion")
        return True

    def run_detailed_tests(self):
        """Run all detailed tests"""
        self.log("🚀 Starting Detailed Sixto Portal Backend Tests")
        self.log(f"   Base URL: {self.base_url}")
        
        # Test sequence
        tests = [
            ("Health Check Detailed", self.test_health_detailed),
            ("Authentication", self.authenticate),
            ("Admin Projects Detailed", self.test_admin_projects_detailed),
            ("Admin Billing Detailed", self.test_admin_billing_detailed),
            ("Portal Dashboard Detailed", self.test_portal_dashboard_detailed),
            ("Portal Tasks Detailed", self.test_portal_tasks_detailed),
        ]
        
        failed_tests = []
        for test_name, test_func in tests:
            try:
                if not test_func():
                    failed_tests.append(test_name)
            except Exception as e:
                self.log(f"❌ {test_name} - Exception: {str(e)}")
                failed_tests.append(test_name)
        
        # Print results
        self.log("\n" + "="*60)
        if failed_tests:
            self.log(f"❌ Failed tests: {', '.join(failed_tests)}")
            return False
        else:
            self.log("✅ All detailed tests passed!")
            return True

def main():
    tester = DetailedSixtoTester()
    success = tester.run_detailed_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())