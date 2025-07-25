import requests
import unittest
import json
from datetime import datetime, timedelta
import random
import string

class EngineRentAPITest(unittest.TestCase):
    def setUp(self):
        self.base_url = "http://localhost:8001/api"
        self.admin_credentials = {
            "email": "admin@enginerent.com",
            "password": "admin123"
        }
        self.test_user_credentials = {
            "email": f"test_user_{datetime.now().strftime('%Y%m%d%H%M%S')}@test.com",
            "password": "Test123!",
            "name": "Test User",
            "phone": "0123456789",
            "address": "123 Test Street",
            "role": "client"
        }
        self.admin_token = None
        self.user_token = None
        self.test_engine_id = None
        self.test_reservation_id = None

    def get_headers(self, token=None):
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        return headers

    def test_01_api_root(self):
        """Test if the API root endpoint is accessible"""
        response = requests.get(f"{self.base_url}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"message": "Hello World"})
        print("✅ API root endpoint is accessible")

    def test_02_register_user(self):
        """Test user registration"""
        response = requests.post(
            f"{self.base_url}/auth/register",
            json=self.test_user_credentials,
            headers=self.get_headers()
        )
        self.assertEqual(response.status_code, 200)
        user_data = response.json()
        self.assertEqual(user_data["email"], self.test_user_credentials["email"])
        self.assertEqual(user_data["role"], "client")
        print(f"✅ User registration successful: {user_data['email']}")

    def test_03_login_admin(self):
        """Test admin login"""
        response = requests.post(
            f"{self.base_url}/auth/login",
            json=self.admin_credentials,
            headers=self.get_headers()
        )
        self.assertEqual(response.status_code, 200)
        token_data = response.json()
        self.assertIn("access_token", token_data)
        self.admin_token = token_data["access_token"]
        print("✅ Admin login successful")

    def test_04_login_user(self):
        """Test user login"""
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={
                "email": self.test_user_credentials["email"],
                "password": self.test_user_credentials["password"]
            },
            headers=self.get_headers()
        )
        self.assertEqual(response.status_code, 200)
        token_data = response.json()
        self.assertIn("access_token", token_data)
        self.user_token = token_data["access_token"]
        print("✅ User login successful")

    def test_05_get_current_user(self):
        """Test getting current user info"""
        response = requests.get(
            f"{self.base_url}/auth/me",
            headers=self.get_headers(self.admin_token)
        )
        self.assertEqual(response.status_code, 200)
        user_data = response.json()
        self.assertEqual(user_data["email"], self.admin_credentials["email"])
        self.assertEqual(user_data["role"], "admin")
        print("✅ Get current user info successful")

    def test_06_get_engines(self):
        """Test getting all engines"""
        response = requests.get(
            f"{self.base_url}/engines",
            headers=self.get_headers(self.user_token)
        )
        self.assertEqual(response.status_code, 200)
        engines = response.json()
        self.assertIsInstance(engines, list)
        if engines:
            self.test_engine_id = engines[0]["id"]
            print(f"✅ Get engines successful, found {len(engines)} engines")
        else:
            print("⚠️ No engines found")

    def test_07_get_engine_by_id(self):
        """Test getting an engine by ID"""
        if not self.test_engine_id:
            self.skipTest("No engine ID available")
        
        response = requests.get(
            f"{self.base_url}/engines/{self.test_engine_id}",
            headers=self.get_headers(self.user_token)
        )
        self.assertEqual(response.status_code, 200)
        engine = response.json()
        self.assertEqual(engine["id"], self.test_engine_id)
        print(f"✅ Get engine by ID successful: {engine['name']}")

    def test_08_create_engine(self):
        """Test creating a new engine (admin only)"""
        new_engine = {
            "name": f"Test Engine {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "description": "Test engine description",
            "category": "excavatrice",
            "brand": "Test Brand",
            "daily_rate": 250.0,
            "location": "Test Location",
            "images": ["https://example.com/test-image.jpg"],
            "specifications": {"weight": "15t", "power": "120hp"}
        }
        
        response = requests.post(
            f"{self.base_url}/engines",
            json=new_engine,
            headers=self.get_headers(self.admin_token)
        )
        self.assertEqual(response.status_code, 200)
        created_engine = response.json()
        self.assertEqual(created_engine["name"], new_engine["name"])
        self.test_engine_id = created_engine["id"]
        print(f"✅ Create engine successful: {created_engine['name']}")

    def test_09_update_engine(self):
        """Test updating an engine (admin only)"""
        if not self.test_engine_id:
            self.skipTest("No engine ID available")
        
        updated_data = {
            "name": f"Updated Engine {datetime.now().strftime('%Y%m%d%H%M%S')}",
            "description": "Updated description",
            "category": "bulldozer",
            "brand": "Updated Brand",
            "daily_rate": 300.0,
            "location": "Updated Location",
            "images": ["https://example.com/updated-image.jpg"],
            "specifications": {"weight": "18t", "power": "150hp"}
        }
        
        response = requests.put(
            f"{self.base_url}/engines/{self.test_engine_id}",
            json=updated_data,
            headers=self.get_headers(self.admin_token)
        )
        self.assertEqual(response.status_code, 200)
        updated_engine = response.json()
        self.assertEqual(updated_engine["name"], updated_data["name"])
        print(f"✅ Update engine successful: {updated_engine['name']}")

    def test_10_create_reservation(self):
        """Test creating a reservation"""
        if not self.test_engine_id:
            self.skipTest("No engine ID available")
        
        # Create a reservation for tomorrow and the day after
        tomorrow = datetime.now() + timedelta(days=1)
        day_after = tomorrow + timedelta(days=1)
        
        reservation_data = {
            "engine_id": self.test_engine_id,
            "start_date": tomorrow.isoformat(),
            "end_date": day_after.isoformat()
        }
        
        response = requests.post(
            f"{self.base_url}/reservations",
            json=reservation_data,
            headers=self.get_headers(self.user_token)
        )
        self.assertEqual(response.status_code, 200)
        created_reservation = response.json()
        self.assertEqual(created_reservation["engine_id"], self.test_engine_id)
        self.test_reservation_id = created_reservation["id"]
        print(f"✅ Create reservation successful: {created_reservation['id']}")

    def test_11_get_reservations(self):
        """Test getting all reservations"""
        response = requests.get(
            f"{self.base_url}/reservations",
            headers=self.get_headers(self.user_token)
        )
        self.assertEqual(response.status_code, 200)
        reservations = response.json()
        self.assertIsInstance(reservations, list)
        print(f"✅ Get reservations successful, found {len(reservations)} reservations")

    def test_12_approve_reservation(self):
        """Test approving a reservation (admin only)"""
        if not self.test_reservation_id:
            self.skipTest("No reservation ID available")
        
        response = requests.put(
            f"{self.base_url}/reservations/{self.test_reservation_id}/approve",
            headers=self.get_headers(self.admin_token)
        )
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertEqual(result["message"], "Reservation approved")
        print("✅ Approve reservation successful")

    def test_13_get_dashboard_stats(self):
        """Test getting dashboard statistics (admin only)"""
        response = requests.get(
            f"{self.base_url}/dashboard/stats",
            headers=self.get_headers(self.admin_token)
        )
        self.assertEqual(response.status_code, 200)
        stats = response.json()
        self.assertIn("engines", stats)
        self.assertIn("reservations", stats)
        self.assertIn("revenue", stats)
        print("✅ Get dashboard stats successful")

    def test_14_delete_engine(self):
        """Test deleting an engine (admin only)"""
        if not self.test_engine_id:
            self.skipTest("No engine ID available")
        
        response = requests.delete(
            f"{self.base_url}/engines/{self.test_engine_id}",
            headers=self.get_headers(self.admin_token)
        )
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertEqual(result["message"], "Engine deleted successfully")
        print("✅ Delete engine successful")

def run_tests():
    # Create a test suite
    suite = unittest.TestSuite()
    
    # Add tests in order
    test_cases = [
        'test_01_api_root',
        'test_02_register_user',
        'test_03_login_admin',
        'test_04_login_user',
        'test_05_get_current_user',
        'test_06_get_engines',
        'test_07_get_engine_by_id',
        'test_08_create_engine',
        'test_09_update_engine',
        'test_10_create_reservation',
        'test_11_get_reservations',
        'test_12_approve_reservation',
        'test_13_get_dashboard_stats',
        'test_14_delete_engine'
    ]
    
    for test_case in test_cases:
        suite.addTest(EngineRentAPITest(test_case))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)

if __name__ == "__main__":
    print("🔍 Starting EngineRent Pro API Tests...")
    run_tests()
    print("✅ API Tests completed!")