from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from app.models import Product, Shop

User = get_user_model()

TEST_SETTINGS = {
    "DATABASES": {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}},
    "SECRET_KEY": "test",
    "ROOT_URLCONF": "shop.urls",
}


@override_settings(**TEST_SETTINGS)
class ProductListTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.product = Product.objects.create(
            name="Silk Kurta", mrp=2000, price=1500, stock=10
        )

    def test_list_products(self):
        resp = self.client.get("/api/products/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["count"], 1)

    def test_retrieve_product(self):
        resp = self.client.get(f"/api/products/{self.product.id}/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["name"], "Silk Kurta")

    def test_retrieve_nonexistent(self):
        resp = self.client.get("/api/products/99999/")
        self.assertEqual(resp.status_code, 404)


@override_settings(**TEST_SETTINGS)
class ProductCreateUpdateTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="admin@test.com",
            email="admin@test.com",
            password="admin1234",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.admin)
        self.product = Product.objects.create(
            name="Kurta", mrp=1000, price=800, stock=5
        )

    def test_create_product(self):
        resp = self.client.post(
            "/api/products/",
            {"name": "New Kurta", "mrp": 500, "price": 400, "stock": 10},
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Product.objects.count(), 2)

    def test_update_product(self):
        resp = self.client.patch(
            f"/api/products/{self.product.id}/",
            {"price": 700},
            format="json",
        )
        self.assertEqual(resp.status_code, 200)
        self.product.refresh_from_db()
        self.assertEqual(self.product.price, 700)

    def test_delete_product(self):
        resp = self.client.delete(f"/api/products/{self.product.id}/")
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(Product.objects.count(), 0)

    def test_unauthenticated_create(self):
        self.client.force_authenticate(user=None)
        resp = self.client.post(
            "/api/products/",
            {"name": "X", "mrp": 100, "price": 80},
            format="json",
        )
        self.assertEqual(resp.status_code, 401)

    def test_non_admin_create(self):
        user = User.objects.create_user(
            username="user@test.com", email="user@test.com", password="pass1234"
        )
        self.client.force_authenticate(user=user)
        resp = self.client.post(
            "/api/products/",
            {"name": "X", "mrp": 100, "price": 80},
            format="json",
        )
        self.assertEqual(resp.status_code, 403)


@override_settings(**TEST_SETTINGS)
class ProductHomeTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.p1 = Product.objects.create(
            name="Home Product", mrp=1000, price=800, show_on_home=True, stock=5
        )
        self.p2 = Product.objects.create(
            name="Not Home", mrp=500, price=400, show_on_home=False, stock=5
        )

    def test_home_endpoint(self):
        resp = self.client.get("/api/products/home/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]["name"], "Home Product")


@override_settings(**TEST_SETTINGS)
class ProductToggleHomeTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="admin@test.com",
            email="admin@test.com",
            password="admin1234",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.admin)
        self.product = Product.objects.create(
            name="Toggle Me", mrp=1000, price=800, show_on_home=False, stock=5
        )

    def test_toggle_home(self):
        resp = self.client.patch(f"/api/products/{self.product.id}/toggle_home/")
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data["show_on_home"])

    def test_toggle_home_back(self):
        self.product.show_on_home = True
        self.product.save()
        resp = self.client.patch(f"/api/products/{self.product.id}/toggle_home/")
        self.assertFalse(resp.data["show_on_home"])


@override_settings(**TEST_SETTINGS)
class ProductOutOfStockTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="admin@test.com",
            email="admin@test.com",
            password="admin1234",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.admin)
        self.product = Product.objects.create(
            name="Stocked", mrp=1000, price=800, stock=50
        )

    def test_out_of_stock(self):
        resp = self.client.patch(f"/api/products/{self.product.id}/out_of_stock/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["stock"], 0)


@override_settings(**TEST_SETTINGS)
class ProductSearchTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        Product.objects.create(
            name="Blue Silk Kurta", mrp=2000, price=1500, category="Womens Wear", stock=5
        )
        Product.objects.create(
            name="Cotton T-Shirt", mrp=500, price=350, category="Mens Wear", stock=10
        )

    def test_search_by_name(self):
        resp = self.client.get("/api/products/?search=Silk")
        self.assertEqual(resp.data["count"], 1)

    def test_search_by_category(self):
        resp = self.client.get("/api/products/?search=Cotton")
        self.assertEqual(resp.data["count"], 1)
