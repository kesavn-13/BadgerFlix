from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uuid
import os
import tempfile
from typing import Dict, List
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file - explicitly from backend directory
backend_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(backend_dir, '.env')
load_dotenv(env_path)
# Also try loading from current directory
load_dotenv()

from models import Course, Episode, Question, UserProgress, LoginRequest, LoginResponse
from storage import courses, episodes, questions, user_progress, achievements, users, sessions
import secrets
from ai import transcribe_audio, generate_episodes_from_transcript, ask_ai_tutor
from datetime import datetime, date

app = FastAPI(title="BadgerFlix API")

# CORS middleware - Update with your production frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://badger-flix.vercel.app",
        "https://badger-flix-gm4o.vercel.app",
        "https://*.vercel.app",  # Allow all Vercel deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class AskAIRequest(BaseModel):
    question: str

class AskInstructorRequest(BaseModel):
    question_text: str
    is_anonymous: bool = True

class AnswerRequest(BaseModel):
    answer_text: str

# Seed some sample data on startup
def seed_sample_data():
    """Add preloaded sample courses for demo - VC pitch ready content"""
    sample_courses = [
        {
            "id": "ml101",
            "title": "Machine Learning Fundamentals",
            "subject": "Computer Science",
            "description": "Master AI and ML from scratch. Learn neural networks, deep learning, and build real-world projects. Perfect for aspiring data scientists and engineers.",
            "episodes": [
                {
                    "id": "ml101-ep1",
                    "title": "Episode 1: The AI Revolution - Why Machine Learning Matters",
                    "summary": "Discover how machine learning is transforming industries from healthcare to finance. Learn the fundamentals and see real-world applications that are changing the world.",
                    "key_points": ["What is AI vs ML", "Real-world ML applications", "Why ML is the future", "Getting started roadmap"],
                    "transcript": "Machine learning is revolutionizing every industry. From Netflix recommendations to self-driving cars, ML is everywhere. In this episode, we'll explore what makes machine learning so powerful and why it's the most important technology of our time. Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. Unlike traditional programming where we write explicit instructions, machine learning algorithms build mathematical models based on training data to make predictions or decisions. The key difference between AI and ML is that AI is the broader concept of machines carrying out tasks in a smart way, while ML is a specific application of AI that trains machines to learn from data. Real-world applications of machine learning are everywhere around us. When you watch Netflix, the recommendation system uses ML to suggest shows you might like based on your viewing history. Self-driving cars use ML to recognize objects, pedestrians, and road signs. Email spam filters use ML to identify and block unwanted messages. Healthcare systems use ML to diagnose diseases from medical images. Financial institutions use ML to detect fraudulent transactions. The reason ML is so powerful is its ability to find patterns in vast amounts of data that humans could never process manually. As we generate more data every day, machine learning becomes increasingly valuable for extracting insights and making predictions. Getting started with machine learning requires understanding three fundamental concepts: data, algorithms, and models. Data is the fuel that powers ML systems. Algorithms are the mathematical procedures that learn from data. Models are the learned representations that make predictions. The future of machine learning looks incredibly promising, with applications in climate science, drug discovery, personalized education, and much more."
                },
                {
                    "id": "ml101-ep2",
                    "title": "Episode 2: Supervised vs Unsupervised Learning",
                    "summary": "Dive deep into the two main paradigms of machine learning. Understand when to use each approach with practical examples and hands-on insights.",
                    "key_points": ["Supervised learning explained", "Unsupervised learning basics", "When to use each type", "Real-world examples"],
                    "transcript": "There are three main types of machine learning: supervised, unsupervised, and reinforcement. Supervised learning uses labeled data to train models, while unsupervised learning finds patterns in unlabeled data. Let's start with supervised learning. In supervised learning, we have a dataset with input features and corresponding output labels. The algorithm learns to map inputs to outputs by finding patterns in the labeled examples. For instance, if we want to predict house prices, we provide the algorithm with many examples of houses, each with features like size, location, number of bedrooms, and the actual price. The algorithm learns the relationship between these features and the price. Common supervised learning tasks include classification, where we predict categories like spam or not spam, and regression, where we predict continuous values like prices or temperatures. Popular supervised learning algorithms include linear regression, decision trees, random forests, and neural networks. Unsupervised learning, on the other hand, works with data that has no labels. The algorithm must find hidden patterns or structures in the data on its own. Clustering is a common unsupervised learning task where the algorithm groups similar data points together. For example, an e-commerce site might use clustering to group customers with similar shopping behaviors. Dimensionality reduction is another unsupervised technique that reduces the number of features while preserving important information. Principal Component Analysis, or PCA, is a well-known dimensionality reduction method. Reinforcement learning is the third type, where an agent learns to make decisions by interacting with an environment. The agent receives rewards or penalties based on its actions and learns to maximize cumulative rewards over time. This is how game-playing AI systems like AlphaGo learn to play complex games. When should you use each type? Use supervised learning when you have labeled data and want to make predictions. Use unsupervised learning when you want to discover hidden patterns or reduce data complexity. Use reinforcement learning for sequential decision-making problems like game playing or robot control."
                },
                {
                    "id": "ml101-ep3",
                    "title": "Episode 3: Neural Networks Demystified",
                    "summary": "Break down neural networks into simple concepts. Learn how artificial neurons work and how they mimic the human brain.",
                    "key_points": ["How neurons work", "Layers and activation functions", "Backpropagation basics", "Building your first network"],
                    "transcript": "Neural networks are inspired by the human brain. Each neuron receives inputs, processes them, and produces an output. When we connect thousands of neurons, we create powerful learning systems. A neural network consists of layers of interconnected nodes called neurons. The first layer is the input layer, which receives the raw data. The last layer is the output layer, which produces the final prediction. Between them are hidden layers that perform complex transformations. Each neuron in a layer is connected to neurons in the next layer through weighted connections. These weights determine how strongly one neuron influences another. During training, the network adjusts these weights to minimize prediction errors. The process of adjusting weights is called backpropagation. When a neural network makes a prediction, data flows forward through the network in a process called forward propagation. Each neuron calculates a weighted sum of its inputs, applies an activation function, and passes the result to the next layer. Activation functions introduce non-linearity, allowing neural networks to learn complex patterns. Common activation functions include the sigmoid function, which maps values to between 0 and 1, the ReLU function, which outputs the input if positive and zero otherwise, and the tanh function. The power of neural networks comes from their ability to learn hierarchical representations. Early layers might detect simple features like edges in an image, while deeper layers combine these to recognize complex objects like faces or cars. Deep learning refers to neural networks with many hidden layers, enabling them to learn extremely complex patterns. Training a neural network requires a large dataset, computational resources, and careful tuning of hyperparameters like learning rate and network architecture."
                }
            ]
        },
        {
            "id": "calc101",
            "title": "Calculus Mastery: From Zero to Hero",
            "subject": "Mathematics",
            "description": "Conquer calculus with intuitive explanations and visual learning. Master derivatives, integrals, and their applications in physics, engineering, and data science.",
            "episodes": [
                {
                    "id": "calc101-ep1",
                    "title": "Episode 1: Limits - The Foundation of Calculus",
                    "summary": "Understand limits through visual examples and intuitive explanations. Learn why limits are crucial for understanding change and motion.",
                    "key_points": ["What are limits?", "Visualizing limits", "Limit laws and properties", "Continuity explained"],
                    "transcript": "Calculus begins with the concept of limits. A limit describes the behavior of a function as it approaches a specific point. Think of it as getting infinitely close to a value without actually reaching it. The formal definition of a limit involves the idea that we can make the function value arbitrarily close to a number by choosing inputs sufficiently close to a point. For example, consider the function f(x) equals x squared. As x approaches 2, f(x) approaches 4. We write this as the limit of f(x) as x approaches 2 equals 4. Limits are fundamental because they allow us to define continuity, derivatives, and integrals. A function is continuous at a point if the limit exists at that point and equals the function value. This means there are no jumps, breaks, or holes in the graph at that point. Limit laws help us calculate limits more easily. The sum law states that the limit of a sum equals the sum of the limits. The product law states that the limit of a product equals the product of the limits. The quotient law applies to division, with the important caveat that the denominator's limit must not be zero. When direct substitution results in an indeterminate form like zero divided by zero, we need special techniques. Factoring, rationalizing, or using L'Hopital's rule can help resolve these cases. One-sided limits examine the behavior of a function as we approach from either the left or right side. The limit exists only if both one-sided limits exist and are equal. Understanding limits is crucial because they form the foundation for derivatives, which measure instantaneous rates of change, and integrals, which measure accumulated change."
                },
                {
                    "id": "calc101-ep2",
                    "title": "Episode 2: Derivatives - The Rate of Change",
                    "summary": "Master derivatives and understand how they describe rates of change. Learn the power rule, chain rule, and real-world applications.",
                    "key_points": ["Derivative definition", "Power rule and chain rule", "Finding slopes and rates", "Optimization problems"],
                    "transcript": "Derivatives measure how fast something changes. If you're driving, the derivative of your position is your speed. If you're investing, the derivative shows how your portfolio grows. The derivative of a function at a point represents the instantaneous rate of change, which is the slope of the tangent line at that point. Geometrically, the derivative tells us how steep the curve is. If the derivative is large and positive, the function is increasing rapidly. If it's negative, the function is decreasing. The derivative is defined as the limit of the difference quotient as the change in x approaches zero. This limit gives us the exact slope at a single point, rather than an average slope over an interval. The power rule is one of the most fundamental derivative rules. It states that the derivative of x to the power of n is n times x to the power of n minus one. For example, the derivative of x cubed is 3x squared. The chain rule allows us to differentiate composite functions. If we have a function of a function, we multiply the derivative of the outer function by the derivative of the inner function. The product rule helps us differentiate functions that are multiplied together. The quotient rule applies to functions that are divided. Derivatives have countless applications. In physics, velocity is the derivative of position, and acceleration is the derivative of velocity. In economics, marginal cost is the derivative of the total cost function. In optimization problems, we find maximum or minimum values by setting the derivative equal to zero and solving for critical points. Understanding derivatives opens the door to solving complex real-world problems involving rates of change and optimization."
                }
            ]
        },
        {
            "id": "bio101",
            "title": "Cell Biology: The Building Blocks of Life",
            "subject": "Biology",
            "description": "Explore the fascinating world inside every living cell. Understand organelles, cellular processes, and how life functions at the microscopic level.",
            "episodes": [
                {
                    "id": "bio101-ep1",
                    "title": "Episode 1: Journey Inside the Cell",
                    "summary": "Take a virtual tour of a cell and discover its incredible complexity. Learn about organelles and their vital functions in keeping life alive.",
                    "key_points": ["Cell membrane structure", "Nucleus and DNA", "Mitochondria - the powerhouse", "Ribosomes and protein synthesis"],
                    "transcript": "Cells are the fundamental units of life. Every living organism, from bacteria to humans, is composed of cells. Inside each cell is a complex world of organelles working together. The cell membrane, also called the plasma membrane, is a phospholipid bilayer that surrounds the cell and controls what enters and exits. It's selectively permeable, meaning it allows some substances to pass through while blocking others. The nucleus is the control center of the cell, containing the cell's DNA. DNA carries the genetic instructions needed for the cell to function, grow, and reproduce. The nucleus is surrounded by a nuclear envelope with pores that allow materials to move in and out. Mitochondria are often called the powerhouses of the cell because they produce ATP, the energy currency of cells, through cellular respiration. These organelles have their own DNA and can reproduce independently, suggesting they evolved from ancient bacteria that were engulfed by larger cells. Ribosomes are the protein factories of the cell. They read the genetic code from messenger RNA and assemble amino acids into proteins according to those instructions. Ribosomes can be found floating in the cytoplasm or attached to the rough endoplasmic reticulum. The endoplasmic reticulum, or ER, is a network of membranes. The rough ER has ribosomes attached and is involved in protein synthesis and modification. The smooth ER lacks ribosomes and is involved in lipid synthesis and detoxification. The Golgi apparatus packages and ships proteins to their final destinations. It receives proteins from the ER, modifies them, and packages them into vesicles for transport. Lysosomes are the cell's recycling centers, containing enzymes that break down waste materials and cellular debris. Each organelle has a specific function, but they all work together to keep the cell alive and functioning properly."
                },
                {
                    "id": "bio101-ep2",
                    "title": "Episode 2: DNA and Genetic Information",
                    "summary": "Unlock the secrets of DNA and understand how genetic information is stored, copied, and used to build life.",
                    "key_points": ["DNA structure", "How DNA stores information", "Replication process", "Genes and proteins"],
                    "transcript": "DNA is the blueprint of life. This double helix molecule contains all the instructions needed to build and maintain an organism. In this episode, we'll explore how this incredible molecule works. DNA, or deoxyribonucleic acid, has a double helix structure discovered by Watson and Crick in 1953. The molecule consists of two strands that wind around each other like a twisted ladder. Each strand is made up of nucleotides, which contain a sugar molecule, a phosphate group, and one of four nitrogenous bases: adenine, thymine, guanine, or cytosine. The bases pair specifically: adenine always pairs with thymine, and guanine always pairs with cytosine. This complementary base pairing is crucial for DNA replication and ensures genetic information is accurately copied. The sequence of these bases along the DNA strand encodes genetic information. Genes are specific sequences of DNA that code for proteins. The process of gene expression involves two main steps: transcription, where DNA is copied into messenger RNA, and translation, where mRNA is used to build proteins. DNA replication occurs before cell division, ensuring each new cell receives a complete copy of the genetic material. The process is semi-conservative, meaning each new DNA molecule contains one original strand and one newly synthesized strand. DNA is incredibly stable and can store vast amounts of information in a compact form. The human genome contains about 3 billion base pairs, yet it fits inside the nucleus of every cell. Mutations, or changes in the DNA sequence, can occur naturally or be caused by environmental factors. Some mutations are harmless, while others can lead to genetic diseases or provide advantages that drive evolution."
                }
            ]
        },
        {
            "id": "ds101",
            "title": "Data Science Essentials",
            "subject": "Computer Science",
            "description": "Transform raw data into insights. Learn Python, pandas, visualization, and statistical analysis. Build a portfolio of real data science projects.",
            "episodes": [
                {
                    "id": "ds101-ep1",
                    "title": "Episode 1: What is Data Science?",
                    "summary": "Introduction to the data science workflow. Learn how data scientists solve real problems using data, statistics, and machine learning.",
                    "key_points": ["Data science workflow", "Key tools and languages", "Real-world case studies", "Career paths in data science"],
                    "transcript": "Data science combines statistics, programming, and domain expertise to extract insights from data. In this episode, we'll explore the complete data science lifecycle. The data science workflow typically begins with problem definition, where we identify the business question we want to answer or the problem we want to solve. Next comes data collection, gathering relevant data from various sources like databases, APIs, or web scraping. Data cleaning and preprocessing is often the most time-consuming step, involving handling missing values, removing duplicates, correcting errors, and transforming data into a usable format. Exploratory data analysis helps us understand the data through visualizations and statistical summaries. We look for patterns, correlations, outliers, and distributions that might inform our modeling approach. Feature engineering involves creating new variables or transforming existing ones to improve model performance. This might include creating interaction terms, encoding categorical variables, or scaling numerical features. Model selection and training involves choosing appropriate algorithms like linear regression, decision trees, or neural networks, and training them on our data. We split our data into training and testing sets to evaluate model performance. Model evaluation uses metrics like accuracy, precision, recall, or mean squared error depending on whether we're doing classification or regression. Finally, we deploy the model and monitor its performance in production, making adjustments as needed. Data scientists use tools like Python with libraries such as pandas for data manipulation, scikit-learn for machine learning, and matplotlib for visualization. The field requires strong analytical thinking, programming skills, and the ability to communicate findings to stakeholders."
                }
            ]
        },
        {
            "id": "phys101",
            "title": "Quantum Physics Explained",
            "subject": "Physics",
            "description": "Demystify quantum mechanics with clear explanations and thought experiments. Understand wave-particle duality, uncertainty principle, and quantum entanglement.",
            "episodes": [
                {
                    "id": "phys101-ep1",
                    "title": "Episode 1: The Quantum World",
                    "summary": "Enter the strange world of quantum physics where particles can be in multiple places at once and reality is fundamentally probabilistic.",
                    "key_points": ["Wave-particle duality", "Double-slit experiment", "Quantum superposition", "Why quantum mechanics matters"],
                    "transcript": "Quantum physics describes the behavior of matter and energy at the smallest scales. At this level, the rules are completely different from our everyday experience. At the quantum level, particles exhibit wave-particle duality, meaning they can behave both as particles and as waves depending on how we observe them. The famous double-slit experiment demonstrates this strange behavior. When we don't observe which slit a particle passes through, it creates an interference pattern like a wave. But when we observe it, it behaves like a particle. Quantum superposition is the principle that particles can exist in multiple states simultaneously until they're observed. Schrodinger's cat is a famous thought experiment illustrating this: a cat in a box is both alive and dead until we open the box and observe it. The uncertainty principle, formulated by Heisenberg, states that we cannot simultaneously know both the exact position and momentum of a particle with perfect accuracy. The more precisely we know one, the less precisely we can know the other. Quantum entanglement is another bizarre phenomenon where two particles become linked in such a way that measuring one instantly affects the other, regardless of distance. Einstein called this spooky action at a distance. Quantum mechanics has led to revolutionary technologies like lasers, MRI machines, and quantum computers. Quantum computers use quantum bits, or qubits, which can be in superposition, potentially solving certain problems exponentially faster than classical computers. Despite its strangeness, quantum mechanics is one of the most successful and well-tested theories in physics, accurately predicting experimental results to incredible precision."
                }
            ]
        },
        {
            "id": "chem101",
            "title": "Organic Chemistry Made Simple",
            "subject": "Chemistry",
            "description": "Master organic chemistry with visual learning and step-by-step mechanisms. Understand reactions, synthesis, and molecular structures.",
            "episodes": [
                {
                    "id": "chem101-ep1",
                    "title": "Episode 1: Carbon - The Element of Life",
                    "summary": "Discover why carbon is the foundation of organic chemistry and life itself. Learn about bonding, hybridization, and molecular structures.",
                    "key_points": ["Why carbon is special", "Covalent bonding", "Hybridization concepts", "Building organic molecules"],
                    "transcript": "Carbon is unique among elements. Its ability to form four bonds and create chains makes it the basis of all organic molecules and life as we know it. Carbon has an atomic number of 6, meaning it has 6 protons and typically 6 neutrons. Its electron configuration allows it to form four covalent bonds, creating a tetrahedral geometry. This four-bond capacity is crucial because it enables carbon to form long chains, branched structures, and rings. Carbon can form single, double, or triple bonds with other carbon atoms or with other elements like hydrogen, oxygen, nitrogen, and sulfur. Single bonds allow rotation, giving molecules flexibility. Double bonds create planar structures and prevent rotation. Triple bonds create linear structures. Hybridization explains how carbon achieves its bonding geometry. In sp3 hybridization, one s orbital and three p orbitals combine to form four equivalent sp3 orbitals, resulting in tetrahedral geometry with 109.5 degree bond angles. This is seen in methane and alkanes. In sp2 hybridization, one s and two p orbitals combine, leaving one p orbital unhybridized. This creates trigonal planar geometry with 120 degree bond angles, seen in alkenes. In sp hybridization, one s and one p orbital combine, leaving two p orbitals unhybridized, creating linear geometry with 180 degree bond angles, seen in alkynes. The diversity of carbon compounds comes from its ability to form these various bond types and geometries. Organic molecules range from simple methane to complex proteins and DNA. Understanding carbon's bonding is fundamental to understanding all of organic chemistry and biochemistry."
                }
            ]
        }
    ]
    
    for course_data in sample_courses:
        course_id = course_data["id"]
        episode_ids = []
        
        for ep_data in course_data["episodes"]:
            ep_id = ep_data["id"]
            episodes[ep_id] = Episode(
                id=ep_id,
                course_id=course_id,
                title=ep_data["title"],
                summary=ep_data["summary"],
                key_points=ep_data["key_points"],
                transcript=ep_data["transcript"]
            )
            episode_ids.append(ep_id)
        
        courses[course_id] = Course(
            id=course_id,
            title=course_data["title"],
            subject=course_data["subject"],
            description=course_data["description"],
            episode_ids=episode_ids
        )

@app.on_event("startup")
async def startup_event():
    seed_sample_data()

@app.get("/")
def root():
    return {"message": "BadgerFlix API", "status": "running"}

# Authentication
@app.post("/auth/login", response_model=LoginResponse)
def login(body: LoginRequest):
    """Login endpoint for students and instructors"""
    user = users.get(body.email)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if user.password != body.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if user.role != body.role:
        raise HTTPException(status_code=403, detail=f"Access denied. This account is for {user.role}s only.")
    
    # Generate token
    token = secrets.token_urlsafe(32)
    sessions[token] = user.id
    
    return LoginResponse(
        token=token,
        user_id=user.id,
        role=user.role,
        name=user.name
    )

@app.post("/auth/logout")
def logout(token: str):
    """Logout endpoint"""
    if token in sessions:
        del sessions[token]
    return {"status": "logged_out"}

@app.get("/auth/me")
def get_current_user(token: str):
    """Get current user info"""
    user_id = sessions.get(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Find user by id
    user = next((u for u in users.values() if u.id == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.name
    }

@app.post("/upload-lecture")
async def upload_lecture(
    file: UploadFile = File(...),
    title: str = Form(...),
    subject: str = Form(...)
):
    """Upload lecture audio/video and generate episodes"""
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"Received upload request - subject: {subject}, title: {title}, file: {file.filename}")
        # Save uploaded file temporarily
        file_id = str(uuid.uuid4())
        suffix = os.path.splitext(file.filename)[1] or ".mp3"
        temp_path = os.path.join(tempfile.gettempdir(), f"{file_id}{suffix}")
        
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Transcribe audio using Gemini
        try:
            transcript = transcribe_audio(temp_path)
        except Exception as e:
            error_msg = str(e)
            raise HTTPException(status_code=500, detail=f"Error transcribing audio: {error_msg}")
        
        # Generate episodes using Gemini
        try:
            eps_raw = generate_episodes_from_transcript(transcript, title)
        except Exception as e:
            error_msg = str(e)
            raise HTTPException(status_code=500, detail=f"Error generating episodes: {error_msg}")
        
        # Create course and episodes
        course_id = str(uuid.uuid4())
        ep_ids = []
        
        for idx, ep in enumerate(eps_raw):
            eid = str(uuid.uuid4())
            # Use transcript if available, otherwise use transcript_excerpt, otherwise use summary
            episode_transcript = ep.get("transcript", "") or ep.get("transcript_excerpt", "") or ep.get("summary", "")
            episodes[eid] = Episode(
                id=eid,
                course_id=course_id,
                title=ep.get("title", f"Episode {idx + 1}"),
                summary=ep.get("summary", ""),
                key_points=ep.get("key_points", []),
                transcript=episode_transcript
            )
            ep_ids.append(eid)
        
        courses[course_id] = Course(
            id=course_id,
            title=title,
            subject=subject,
            description=f"AI-generated course from uploaded lecture: {title}",
            episode_ids=ep_ids
        )
        
        logger.info(f"Successfully created course {course_id} with {len(ep_ids)} episodes")
        
        # Clean up temp file
        os.remove(temp_path)
        
        return {"course_id": course_id, "episodes_created": len(ep_ids)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing lecture: {str(e)}")

@app.get("/subjects")
def get_subjects():
    """Get all available subjects"""
    subjects = list(set([c.subject for c in courses.values()]))
    return {"subjects": subjects}

@app.get("/subject/{subject}/courses")
def get_courses_by_subject(subject: str):
    """Get all courses for a specific subject"""
    subject_courses = [
        {
            "id": c.id,
            "title": c.title,
            "subject": c.subject,
            "description": c.description,
            "episode_count": len(c.episode_ids),
            "episode_ids": c.episode_ids  # Include for progress calculation
        }
        for c in courses.values()
        if c.subject.lower() == subject.lower()
    ]
    return {"courses": subject_courses}

@app.get("/course/{course_id}")
def get_course(course_id: str):
    """Get course details with episodes"""
    if course_id not in courses:
        raise HTTPException(status_code=404, detail="Course not found")
    
    course = courses[course_id]
    episode_list = [
        {
            "id": ep.id,
            "title": ep.title,
            "summary": ep.summary,
            "key_points": ep.key_points
        }
        for ep_id in course.episode_ids
        if ep_id in episodes
        for ep in [episodes[ep_id]]
    ]
    
    return {
        "id": course.id,
        "title": course.title,
        "subject": course.subject,
        "description": course.description,
        "episodes": episode_list
    }

@app.get("/episode/{episode_id}")
def get_episode(episode_id: str):
    """Get episode details"""
    if episode_id not in episodes:
        raise HTTPException(status_code=404, detail="Episode not found")
    
    ep = episodes[episode_id]
    # Ensure transcript is included and formatted properly
    transcript = ep.transcript if ep.transcript else ""
    # Format transcript into readable paragraphs if it's one long string
    if transcript and '\n' not in transcript and len(transcript) > 100:
        # Split by sentences and create paragraphs
        sentences = transcript.split('. ')
        formatted_transcript = '. '.join(sentences)
    else:
        formatted_transcript = transcript
    
    return {
        "id": ep.id,
        "course_id": ep.course_id,
        "title": ep.title,
        "summary": ep.summary,
        "key_points": ep.key_points,
        "transcript": formatted_transcript
    }

@app.post("/episode/{episode_id}/ask-ai")
def ask_ai(episode_id: str, body: AskAIRequest):
    """Ask AI tutor a question about the episode"""
    try:
        if episode_id not in episodes:
            raise HTTPException(status_code=404, detail="Episode not found")
        
        ep = episodes[episode_id]
        episode_dict = {
            "title": ep.title,
            "summary": ep.summary,
            "key_points": ep.key_points,
            "transcript": ep.transcript if ep.transcript else ""
        }
        
        answer = ask_ai_tutor(episode_dict, body.question)
        return {"answer": answer}
    except Exception as e:
        import traceback
        print(f"Error in ask_ai: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating AI response: {str(e)}")

@app.post("/episode/{episode_id}/ask-instructor")
def ask_instructor(episode_id: str, body: AskInstructorRequest):
    """Submit anonymous question to instructor"""
    if episode_id not in episodes:
        raise HTTPException(status_code=404, detail="Episode not found")
    
    qid = str(uuid.uuid4())
    questions[qid] = Question(
        id=qid,
        episode_id=episode_id,
        question_text=body.question_text,
        is_anonymous=body.is_anonymous
    )
    
    return {"question_id": qid, "status": "submitted"}

@app.get("/episode/{episode_id}/questions")
def get_episode_questions(episode_id: str):
    """Get all answered questions for an episode"""
    answered = [
        {
            "id": q.id,
            "question_text": q.question_text,
            "is_anonymous": q.is_anonymous,
            "answer_text": q.answer_text
        }
        for q in questions.values()
        if q.episode_id == episode_id and q.answer_text
    ]
    return {"questions": answered}

@app.get("/instructor/questions")
def get_unanswered_questions():
    """Get all unanswered questions for instructor"""
    unanswered = [
        {
            "id": q.id,
            "episode_id": q.episode_id,
            "question_text": q.question_text,
            "is_anonymous": q.is_anonymous
        }
        for q in questions.values()
        if not q.answer_text
    ]
    return {"questions": unanswered}

@app.post("/question/{question_id}/answer")
def answer_question(question_id: str, body: AnswerRequest):
    """Instructor answers a question"""
    if question_id not in questions:
        raise HTTPException(status_code=404, detail="Question not found")
    
    questions[question_id].answer_text = body.answer_text
    return {"status": "answered", "question_id": question_id}

# WhisperChat Enhancements - Flashcards, Quiz, Slides
@app.post("/episode/{episode_id}/flashcards")
def generate_flashcards(episode_id: str):
    """Generate flashcards for an episode"""
    try:
        if episode_id not in episodes:
            raise HTTPException(status_code=404, detail="Episode not found")
        
        from ai import generate_flashcards as ai_generate_flashcards
        ep = episodes[episode_id]
        episode_dict = {
            "title": ep.title,
            "summary": ep.summary,
            "key_points": ep.key_points,
            "transcript": ep.transcript if ep.transcript else ""
        }
        
        flashcards = ai_generate_flashcards(episode_dict)
        return {"flashcards": flashcards}
    except Exception as e:
        import traceback
        print(f"Error generating flashcards: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating flashcards: {str(e)}")

@app.post("/episode/{episode_id}/quiz")
def generate_quiz(episode_id: str):
    """Generate quiz for an episode"""
    try:
        if episode_id not in episodes:
            raise HTTPException(status_code=404, detail="Episode not found")
        
        from ai import generate_quiz as ai_generate_quiz
        ep = episodes[episode_id]
        episode_dict = {
            "title": ep.title,
            "summary": ep.summary,
            "key_points": ep.key_points,
            "transcript": ep.transcript if ep.transcript else ""
        }
        
        quiz = ai_generate_quiz(episode_dict)
        return {"quiz": quiz}
    except Exception as e:
        import traceback
        print(f"Error generating quiz: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")

@app.post("/episode/{episode_id}/slides")
def generate_slides(episode_id: str):
    """Generate presentation slides for an episode"""
    try:
        if episode_id not in episodes:
            raise HTTPException(status_code=404, detail="Episode not found")
        
        from ai import generate_slides as ai_generate_slides
        ep = episodes[episode_id]
        episode_dict = {
            "title": ep.title,
            "summary": ep.summary,
            "key_points": ep.key_points,
            "transcript": ep.transcript if ep.transcript else ""
        }
        
        slides = ai_generate_slides(episode_dict)
        return {"slides": slides}
    except Exception as e:
        import traceback
        print(f"Error generating slides: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error generating slides: {str(e)}")

# Progress Tracking & Achievements
@app.post("/episode/{episode_id}/mark-watched")
def mark_episode_watched(episode_id: str):
    """Mark an episode as watched"""
    if episode_id not in episodes:
        raise HTTPException(status_code=404, detail="Episode not found")
    
    newly_unlocked = []
    
    if episode_id not in user_progress.watched_episodes:
        user_progress.watched_episodes.append(episode_id)
        user_progress.last_watch_date = datetime.now().isoformat()
        
        # Check for achievements
        ep = episodes[episode_id]
        course = courses.get(ep.course_id)
        
        if course:
            # Check if all episodes in course are watched
            all_watched = all(eid in user_progress.watched_episodes for eid in course.episode_ids)
            if all_watched and ep.course_id not in user_progress.completed_courses:
                user_progress.completed_courses.append(ep.course_id)
                # Award Director achievement
                if "director" not in user_progress.achievements:
                    user_progress.achievements.append("director")
                    newly_unlocked.append("director")
                # Award Cinematographer achievement
                if "cinematographer" not in user_progress.achievements:
                    user_progress.achievements.append("cinematographer")
                    newly_unlocked.append("cinematographer")
    
    return {"status": "watched", "episode_id": episode_id, "new_achievements": newly_unlocked}

@app.post("/quiz/{episode_id}/submit-score")
def submit_quiz_score(episode_id: str, body: dict):
    """Submit quiz score and check for Action Hero achievement"""
    if episode_id not in episodes:
        raise HTTPException(status_code=404, detail="Episode not found")
    
    score = body.get("score", 0)
    newly_unlocked = []
    
    # Award Action Hero achievement for perfect score
    if score == 100 and "action_hero" not in user_progress.achievements:
        user_progress.achievements.append("action_hero")
        newly_unlocked.append("action_hero")
    
    return {"score": score, "new_achievements": newly_unlocked}

@app.get("/progress")
def get_progress():
    """Get user progress"""
    return {
        "watched_episodes": user_progress.watched_episodes,
        "completed_courses": user_progress.completed_courses,
        "my_list": user_progress.my_list,
        "achievements": user_progress.achievements,
        "binge_streak": user_progress.binge_streak
    }

@app.get("/achievements")
def get_achievements():
    """Get all achievements with user's unlocked status"""
    return {
        "achievements": [
            {
                "id": ach.id,
                "name": ach.name,
                "description": ach.description,
                "icon": ach.icon,
                "category": ach.category,
                "unlocked": ach.id in user_progress.achievements
            }
            for ach in achievements.values()
        ]
    }

@app.post("/course/{course_id}/add-to-list")
def add_to_list(course_id: str):
    """Add course to My List"""
    if course_id not in courses:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if course_id not in user_progress.my_list:
        user_progress.my_list.append(course_id)
    
    return {"status": "added", "course_id": course_id}

@app.delete("/course/{course_id}/remove-from-list")
def remove_from_list(course_id: str):
    """Remove course from My List"""
    if course_id in user_progress.my_list:
        user_progress.my_list.remove(course_id)
    
    return {"status": "removed", "course_id": course_id}

@app.get("/continue-watching")
def get_continue_watching():
    """Get courses/episodes to continue watching"""
    continue_watching = []
    
    for course_id in user_progress.my_list + user_progress.completed_courses:
        if course_id not in courses:
            continue
        
        course = courses[course_id]
        watched_count = sum(1 for eid in course.episode_ids if eid in user_progress.watched_episodes)
        total_episodes = len(course.episode_ids)
        progress = (watched_count / total_episodes * 100) if total_episodes > 0 else 0
        
        if progress > 0 and progress < 100:  # In progress, not completed
            continue_watching.append({
                "course_id": course_id,
                "title": course.title,
                "subject": course.subject,
                "progress": progress,
                "watched_episodes": watched_count,
                "total_episodes": total_episodes
            })
    
    return {"continue_watching": continue_watching}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

