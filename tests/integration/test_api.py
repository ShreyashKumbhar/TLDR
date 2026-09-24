"""Real HTTP tests, executed inside the API Compose network (no mocks)."""

import json
import time
import unittest
import uuid
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


SERVICES = {
    "user": (8081, "/api/users"),
    "summary": (8082, "/api/summaries?page=0&size=1"),
    "vote": (8083, "/api/votes/count/0"),
    "comment": (8084, "/api/comments/count/0"),
    "saved": (8085, "/api/saved/check?userId=0&summaryId=0"),
    "recommendation": (8086, "/api/recommendations/user/0?limit=1"),
    "circle": (8087, "/api/circles"),
}


def request(service, path, method="GET", body=None, token=None):
    port, _ = SERVICES[service]
    headers = {"Accept": "application/json"}
    if body is not None:
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = "Bearer " + token
    req = Request(
        f"http://{service}-service:{port}{path}",
        data=json.dumps(body).encode() if body is not None else None,
        headers=headers,
        method=method,
    )
    try:
        response = urlopen(req, timeout=10)
    except HTTPError as error:
        response = error
    with response:
        raw = response.read().decode()
        return response.status, json.loads(raw) if raw else None


class ContainerApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Retry startup only; assertion failures in actual tests are never retried.
        deadline = time.monotonic() + 180
        pending = dict(SERVICES)
        errors = {}
        while pending and time.monotonic() < deadline:
            for service, (_, path) in list(pending.items()):
                try:
                    status, body = request(service, path)
                    if status == 200:
                        del pending[service]
                    else:
                        errors[service] = f"HTTP {status}: {body}"
                except (URLError, TimeoutError, OSError, ValueError) as error:
                    errors[service] = str(error)
            if pending:
                time.sleep(2)
        if pending:
            raise AssertionError(f"Containers did not become ready: {errors}")

    def test_all_services_respond_with_json(self):
        for service, (_, path) in SERVICES.items():
            with self.subTest(service=service):
                status, body = request(service, path)
                self.assertEqual(status, 200, body)
                self.assertIsNotNone(body)

    def test_signup_and_summary_lifecycle(self):
        username = "container_" + uuid.uuid4().hex[:12]
        password = "ContainerTest123!"
        status, auth = request("user", "/api/auth/signup", "POST", {
            "username": username,
            "email": username + "@example.com",
            "password": password,
            "confirmPassword": password,
        })
        self.assertEqual(status, 201, auth)
        self.assertTrue(auth["token"])
        user_id = auth["user"]["id"]

        status, me = request("user", "/api/auth/me", token=auth["token"])
        self.assertEqual(status, 200, me)
        self.assertEqual(me["id"], user_id)

        payload = {
            "title": "Container integration " + username,
            "content": "Written and retrieved through the container API.",
            "originalUrl": "https://example.com/integration",
            "userId": user_id,
            "tags": ["integration"],
        }
        status, created = request("summary", "/api/summaries", "POST", payload)
        self.assertEqual(status, 201, created)
        summary_id = created["id"]
        path = f"/api/summaries/{summary_id}"
        try:
            # The username proves summary-service reached user-service over Docker DNS.
            self.assertEqual(created["username"], username)
            status, fetched = request("summary", path)
            self.assertEqual(status, 200, fetched)
            for field, value in payload.items():
                self.assertEqual(fetched[field], value)
            status, page = request("summary", f"/api/summaries/user/{user_id}")
            self.assertEqual(status, 200, page)
            self.assertIn(summary_id, [item["id"] for item in page["content"]])
        finally:
            status, body = request("summary", f"{path}?userId={user_id}", "DELETE")
            self.assertEqual(status, 204, body)
        status, body = request("summary", path)
        self.assertEqual(status, 404, body)


if __name__ == "__main__":
    unittest.main(verbosity=2)
