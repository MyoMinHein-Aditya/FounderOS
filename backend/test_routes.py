import sys
sys.path.append("d:/Projects/FounderOS/backend")
from app import app

for route in app.routes:
    print(getattr(route, "path", route.path))
