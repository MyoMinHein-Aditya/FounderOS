import ast
import os
import sys
import json

def parse_backend(backend_path):
    nodes = []
    edges = []
    
    # Simple AST visitors
    class AgentVisitor(ast.NodeVisitor):
        def __init__(self, filename):
            self.filename = filename
        
        def visit_ClassDef(self, node):
            if node.name.endswith('Agent'):
                nodes.append({
                    "id": f"agent_{node.name}",
                    "type": "Agent",
                    "label": node.name,
                    "data": {"file": self.filename}
                })
            self.generic_visit(node)

    class ModelVisitor(ast.NodeVisitor):
        def __init__(self, filename):
            self.filename = filename
            
        def visit_ClassDef(self, node):
            # A bit of a heuristic for SQLAlchemy models: inherits from Base or similar
            is_model = any(
                isinstance(base, ast.Name) and base.id in ['Base', 'DeclarativeBase'] for base in node.bases
            )
            # Or if it has __tablename__
            has_tablename = any(
                isinstance(stmt, ast.Assign) and 
                any(isinstance(t, ast.Name) and t.id == '__tablename__' for t in stmt.targets)
                for stmt in node.body
            )
            if is_model or has_tablename:
                nodes.append({
                    "id": f"model_{node.name}",
                    "type": "Database",
                    "label": node.name,
                    "data": {"file": self.filename}
                })
            self.generic_visit(node)
            
    class RouteVisitor(ast.NodeVisitor):
        def __init__(self, filename):
            self.filename = filename
            
        def visit_FunctionDef(self, node):
            for d in node.decorator_list:
                if isinstance(d, ast.Call) and isinstance(d.func, ast.Attribute):
                    if getattr(d.func.value, 'id', '') in ['router', 'app']:
                        if d.func.attr in ['get', 'post', 'put', 'delete', 'patch']:
                            nodes.append({
                                "id": f"api_{node.name}",
                                "type": "API",
                                "label": f"{d.func.attr.upper()} {node.name}",
                                "data": {"file": self.filename}
                            })
            self.generic_visit(node)
            
    # Traverse directories
    for root, _, files in os.walk(backend_path):
        for f in files:
            if not f.endswith('.py'): continue
            if 'venv' in root or '__pycache__' in root: continue
            
            filepath = os.path.join(root, f)
            rel_path = os.path.relpath(filepath, backend_path)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as file:
                    source = file.read()
                tree = ast.parse(source, filename=filepath)
                
                # Check category based on folder
                if 'agents' in rel_path.split(os.sep):
                    AgentVisitor(rel_path).visit(tree)
                elif 'models' in rel_path.split(os.sep):
                    ModelVisitor(rel_path).visit(tree)
                elif 'routes' in rel_path.split(os.sep):
                    RouteVisitor(rel_path).visit(tree)
            except Exception as e:
                pass # skip unparseable files
                
    return {"nodes": nodes, "edges": edges}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        backend_path = sys.argv[1]
    else:
        backend_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'backend')
    
    result = parse_backend(backend_path)
    print(json.dumps(result))
