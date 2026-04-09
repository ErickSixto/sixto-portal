#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class SixtoPortalAPITester:
    def __init__(self, base_url="https://b1c05402-582c-49e2-9942-68c9c17e9616.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_email = "sixto.developer@gmail.com"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 200:
                        print(f"   Response: {response_data}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "/api/health", 200)

    def test_request_magic_link(self):
        """Test magic link request for admin"""
        success, response = self.run_test(
            "Request Magic Link (Admin)",
            "POST",
            "/api/auth/request-magic-link",
            200,
            data={"email": self.admin_email}
        )
        if success and 'mock_code' in response:
            self.mock_code = response['mock_code']
            print(f"   Mock code received: {self.mock_code}")
            return True
        return False

    def test_verify_magic_link(self):
        """Test magic link verification"""
        if not hasattr(self, 'mock_code'):
            print("❌ No mock code available for verification")
            return False
            
        success, response = self.run_test(
            "Verify Magic Link",
            "POST",
            "/api/auth/verify-magic-link",
            200,
            data={"email": self.admin_email, "code": self.mock_code}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token received and stored")
            return True
        return False

    def test_get_me(self):
        """Test get current user"""
        if not self.token:
            print("❌ No token available for authentication")
            return False
            
        return self.run_test("Get Current User", "GET", "/api/auth/me", 200)

    def test_logout(self):
        """Test logout"""
        return self.run_test("Logout", "POST", "/api/auth/logout", 200)

    def test_admin_endpoints(self):
        """Test admin-only endpoints"""
        if not self.token:
            print("❌ No token available for admin tests")
            return False

        endpoints = [
            ("Admin Projects", "/api/admin/projects"),
            ("Admin Clients", "/api/admin/clients"),
            ("Admin Billing", "/api/admin/billing"),
            ("Admin Portals", "/api/admin/portals")
        ]
        
        all_passed = True
        for name, endpoint in endpoints:
            success, _ = self.run_test(name, "GET", endpoint, 200)
            if not success:
                all_passed = False
        
        return all_passed

    def test_portal_endpoints(self):
        """Test portal endpoints"""
        if not self.token:
            print("❌ No token available for portal tests")
            return False

        endpoints = [
            ("Portal Projects", "/api/portal/projects")
        ]
        
        all_passed = True
        for name, endpoint in endpoints:
            success, _ = self.run_test(name, "GET", endpoint, 200)
            if not success:
                all_passed = False
        
        return all_passed

    def test_unauthenticated_access(self):
        """Test that protected endpoints require authentication"""
        # Temporarily clear token
        original_token = self.token
        self.token = None
        
        success, _ = self.run_test(
            "Unauthenticated Access (should fail)",
            "GET",
            "/api/auth/me",
            401
        )
        
        # Restore token
        self.token = original_token
        return success

def main():
    print("🚀 Starting Sixto Portal API Tests")
    print("=" * 50)
    
    tester = SixtoPortalAPITester()
    
    # Test sequence
    tests = [
        ("Health Check", tester.test_health),
        ("Request Magic Link", tester.test_request_magic_link),
        ("Verify Magic Link", tester.test_verify_magic_link),
        ("Get Current User", tester.test_get_me),
        ("Admin Endpoints", tester.test_admin_endpoints),
        ("Portal Endpoints", tester.test_portal_endpoints),
        ("Unauthenticated Access", tester.test_unauthenticated_access),
        ("Logout", tester.test_logout),
    ]
    
    for test_name, test_func in tests:
        print(f"\n📋 Running: {test_name}")
        try:
            test_func()
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
    
    # Print summary
    print("\n" + "=" * 50)
    print(f"📊 Test Summary: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())