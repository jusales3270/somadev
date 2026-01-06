import requests
import time

API_URL = "http://localhost:8000"

def run():
    print("🚀 Auto-Execution Initiated...")
    
    # 1. Get Tasks
    try:
        res = requests.get(f"{API_URL}/tasks")
        tasks = res.json()
    except Exception as e:
        print(f"❌ Failed to fetch tasks: {e}")
        return

    pending_tasks = [t for t in tasks if t['status'] != 'Done']
    
    if not pending_tasks:
        print("✅ No pending tasks found. Everything is already done!")
        return

    print(f"Found {len(pending_tasks)} pending tasks. Executing sequentially...")

    # 2. Execute Each
    for task in pending_tasks:
        print(f"\n▶️ Triggering Task #{task['id']}: {task['title']} ({task['agent']})")
        try:
            # POST to execute
            exe_res = requests.post(f"{API_URL}/execute/{task['id']}")
            if exe_res.status_code == 200:
                print(f"   ✅ Success! Logic executed.")
                print(f"   📝 Result: {exe_res.json().get('result')}")
            else:
                print(f"   ❌ Failed: {exe_res.text}")
        except Exception as e:
            print(f"   ❌ Network Error: {e}")
        
        # Wait a bit to avoid rate limits if using same key extensively
        print("   ⏳ Waiting 10s for API Rate Limit...")
        time.sleep(10)

    print("\n✨ Auto-Execution Complete.")

if __name__ == "__main__":
    run()
