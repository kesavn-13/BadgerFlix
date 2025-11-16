"""Test script to verify upload endpoint works"""
import requests

# Test the upload endpoint
files = {'file': ('test.txt', b'test content', 'text/plain')}
data = {'title': 'Test Course', 'subject': 'Computer Science'}

try:
    response = requests.post('http://localhost:8000/upload-lecture', files=files, data=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")


