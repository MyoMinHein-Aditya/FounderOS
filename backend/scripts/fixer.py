import sys

def replace_in_file(fname, old, new):
    with open(fname, 'r') as f:
        content = f.read()
    with open(fname, 'w') as f:
        f.write(content.replace(old, new))

replace_in_file('tests/repositories/test_goal.py', "{'startup_id': 1}", "{'startup_id': 1, 'title': 'test'}")
replace_in_file('tests/repositories/test_startup.py', "{'owner_id': 1}", "{'owner_id': 1, 'name': 'test'}")
replace_in_file('tests/repositories/test_user.py', 'password_hash', 'password')
