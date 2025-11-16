# LectureFlix Backend

FastAPI backend for LectureFlix.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variable:
```bash
# Create .env file with your OpenAI API key
echo "OPENAI_API_KEY=your_key_here" > .env
```

3. Run the server:
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation.


