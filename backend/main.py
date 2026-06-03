from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
import io
import faiss
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#api key
genai.configure(api_key="AIzaSyDB7TKL2ov9IR692DJduVQvNTkGywH-fAI")
#llm model
llm = genai.GenerativeModel("gemini-3.1-flash-lite")

#embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

#global variables
index = None
stored_chunks = []


@app.get("/")
def root():
    return {"message": "Hello"}

# Upload PDF Route
@app.post("/upload_file")
async def upload_file(file: UploadFile = File(...)):

    global index, stored_chunks

    # Read uploaded file
    content = await file.read()

    # Get filename
    file_name = (file.filename or "").lower()

    # Check if PDF
    if not file_name.endswith(".pdf"):
        return {
            "error": "Only .pdf files are supported"
        }

    # Read PDF
    reader = PdfReader(io.BytesIO(content))

    # Extract text
    resume_text = "\n".join(
        [page.extract_text() or "" for page in reader.pages]
    )

    # Chunking
    chunk_size = 500
    overlap = 100

    chunks = []

    for i in range(0, len(resume_text), chunk_size - overlap):

        chunk = resume_text[i:i + chunk_size]

        chunks.append(chunk)

    # Handle empty PDFs
    if not chunks:
        return {
            "error": "No text found in PDF"
        }

    # Create embeddings
    embeddings = model.encode(chunks)

    # Convert embeddings to float32
    embeddings = np.array(embeddings).astype("float32")

    # Create FAISS index
    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    # Store vectors in FAISS
    index.add(embeddings)

    # Store chunks separately
    stored_chunks = chunks

    return {
        "message": "PDF processed successfully",
        "total_chunks": len(chunks),
        "embedding_dimension": dimension
    }

# Ask Question Route
@app.post("/ask")
async def ask_question(question: str):

    global index, stored_chunks

    # Check if PDF uploaded first
    if index is None:
        return {
            "error": "Please upload a PDF first"
        }

    # Convert question into embedding
    question_embedding = model.encode([question])

    # Convert to float32
    question_embedding = np.array(question_embedding).astype("float32")

    # Search similar chunks
    distances, indices = index.search(question_embedding, k=3)

    # Retrieve matching chunks
    retrieved_chunks = [
        stored_chunks[i]
        for i in indices[0]
    ]

    # Combine chunks into context
    context = "\n\n".join(retrieved_chunks)

    # Prompt for Gemini
    prompt = f"""
    Answer the user's question using ONLY the context below.

    Context:
    {context}

    Question:
    {question}
    """

    # Generate response from Gemini
    response = llm.generate_content(prompt)

    return {
        "question": question,
        "answer": response.text,
        "retrieved_chunks": retrieved_chunks
    }