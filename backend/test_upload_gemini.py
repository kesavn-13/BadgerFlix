"""Test upload with Gemini API"""
import requests
import os

# Set Gemini API key (use your own key from .env file)
# os.environ['GEMINI_API_KEY'] = 'your_key_here'

# Test file
test_file = os.path.join(os.path.expanduser('~'), 'Downloads', 'paper_20251104_081026_segment_1_final.mp3')

if not os.path.exists(test_file):
    print(f"Test file not found: {test_file}")
    exit(1)

print(f"Testing upload with: {os.path.basename(test_file)}")
print(f"File size: {os.path.getsize(test_file) / 1024 / 1024:.2f} MB\n")

# Prepare form data
files = {'file': (os.path.basename(test_file), open(test_file, 'rb'), 'audio/mpeg')}
data = {
    'title': 'Test Course - Paper Segment',
    'subject': 'Computer Science'
}

try:
    print("Sending request to backend...")
    response = requests.post('http://localhost:8000/upload-lecture', files=files, data=data, timeout=300)
    
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {response.text[:500]}\n")
    
    if response.status_code == 200:
        result = response.json()
        print("✅ SUCCESS! Course created!")
        print(f"Course ID: {result.get('course_id')}")
        print(f"Episodes created: {result.get('episodes_created')}")
    else:
        print("❌ Error occurred")
        print(response.text)
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    files['file'][1].close()

