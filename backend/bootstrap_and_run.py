import requests
import time

API_URL = "http://localhost:8000"

def run():
    print("🔄 Bootstrapping 'ArchIndustrial' Project...")

    # 1. Ask Sara to Regenerate Plan
    print("1. Requesting Plan from Sara...")
    chat_payload = {
        "message": "Gere o JSON completo do projeto ArchIndustrial (Landing Page) agora para execução imediata. Seja breve."
    }
    try:
        res = requests.post(f"{API_URL}/chat", json=chat_payload)
        print(f"   Sara Response: {res.json().get('response')[:100]}...")
    except Exception as e:
        print(f"❌ Failed to chat: {e}")
        return

    time.sleep(2) # Give a moment for main.py to process JSON

    # 2. Get Tasks
    print("\n2. Fetching Tasks...")
    try:
        res = requests.get(f"{API_URL}/tasks")
        tasks = res.json()
    except Exception as e:
        print(f"❌ Failed to fetch tasks: {e}")
        return

    if not tasks:
        print("❌ No tasks found even after request. Something is wrong with Sara's output.")
        return

    print(f"   Found {len(tasks)} tasks.")

    # 3. Execute Each
    print("\n3. Executing Tasks...")
    for task in tasks:
        if task['status'] == 'Done':
            continue
            
        print(f"   ▶️ Executing Task #{task['id']}: {task['title']}...")
        try:
            exe_res = requests.post(f"{API_URL}/execute/{task['id']}")
            if exe_res.status_code == 200:
                print(f"      ✅ Success!")
            else:
                print(f"      ❌ Failed: {exe_res.text}")
        except Exception as e:
            print(f"      ❌ Network Error: {e}")
        
        time.sleep(3) # Wait for Gemini generation

    print("\n✨ All Done. Check frontend/src!")

if __name__ == "__main__":
    run()
