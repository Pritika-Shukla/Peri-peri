import sys
import json

def process_command(text):
    return f"You said: {text}"

while True:
    line = sys.stdin.readline()
    if not line:
        break
    
    data = json.loads(line)
    response = process_command(data["message"])
    
    print(json.dumps({"reply": response}))
    sys.stdout.flush()