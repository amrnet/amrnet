import os
import json
from pathlib import Path
import openai # Ensure 'openai' library is installed (pip install openai)
from github import Github, UnknownObjectException # Ensure 'PyGithub' is installed (pip install PyGithub)

# --- Configuration ---
# Environment variables are automatically picked up by os.environ.get()
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
REPO_FULL_NAME = os.environ.get("REPO_FULL_NAME")
ISSUE_NUMBER = os.environ.get("ISSUE_NUMBER") # This will be a string, convert to int when used
COMMENT_BODY = os.environ.get("COMMENT_BODY")
# COMMENT_ID = os.environ.get("COMMENT_ID") # Uncomment and convert to int if needed to react to comments

BOT_USERNAME = "@amr-bot" # The username you chose for your bot trigger

# --- Pre-check environment variables and initialize API clients ---
print("--- Initializing Chatbot Handler ---")

if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY environment variable not found. Exiting.")
    exit(1) # Exit with non-zero code to indicate failure

try:
    # Initialize OpenAI client using the newer library approach
    client = openai.OpenAI(api_key=OPENAI_API_KEY)
    print("OpenAI client initialized.")
except Exception as e:
    print(f"Error initializing OpenAI client: {e}. Exiting.")
    exit(1)

if not GITHUB_TOKEN:
    print("Error: GITHUB_TOKEN environment variable not found. Exiting.")
    exit(1)

if not REPO_FULL_NAME:
    print("Error: REPO_FULL_NAME environment variable not found. Exiting.")
    exit(1)

if not ISSUE_NUMBER:
    print("Error: ISSUE_NUMBER environment variable not found. Exiting.")
    exit(1)
try:
    ISSUE_NUMBER = int(ISSUE_NUMBER)
    print(f"Processing Issue #{ISSUE_NUMBER}")
except ValueError:
    print(f"Error: ISSUE_NUMBER '{ISSUE_NUMBER}' is not a valid integer. Exiting.")
    exit(1)

if not COMMENT_BODY:
    print("Error: COMMENT_BODY environment variable not found. Exiting.")
    exit(1)

try:
    g = Github(GITHUB_TOKEN)
    repo = g.get_repo(REPO_FULL_NAME)
    print(f"GitHub repository '{REPO_FULL_NAME}' connected.")
except Exception as e:
    print(f"Error connecting to GitHub repository '{REPO_FULL_NAME}': {e}. Exiting.")
    exit(1)

# --- Helper Functions ---

def get_repo_overview():
    """
    Fetches a brief overview of the repository.
    Reads the README.md if available, otherwise provides a default summary.
    """
    readme_path = Path("README.md") # Assumes README.md is at the repo root
    print(f"Attempting to read repository overview from {readme_path}...")
    if readme_path.exists():
        try:
            with open(readme_path, "r", encoding="utf-8") as f:
                readme_content = f.read()
            # Return first N lines or a summary. Adjust N as needed.
            summary_lines = readme_content.splitlines()[:30]
            print(f"Read {len(summary_lines)} lines from README.md.")
            return "\n".join(summary_lines)
        except Exception as e:
            print(f"Error reading README.md: {e}") # Return a more accurate fallback description
            return "AMRNet is a web application for visualizing and analyzing Antimicrobial Resistance (AMR) data. (Error reading README.md)."
    else:
        print(f"README.md not found at {readme_path}.")
        return "AMRNet is a web application for visualizing and analyzing Antimicrobial Resistance (AMR) data. (README.md not found for more details)."

def get_file_content(file_path):
    """Fetches the content of a specific file from the repository."""
    # Basic sanitization to prevent directory traversal
    if ".." in file_path or file_path.startswith("/") or file_path.startswith("\\"):
        print(f"Blocked invalid file path attempt: {file_path}")
        return "Error: Invalid file path. Please provide a relative path within the repository."

    full_path = Path(file_path)
    print(f"Attempting to read file content from {full_path}...")

    if full_path.exists():
        try:
            with open(full_path, "r", encoding="utf-8") as f:
                content = f.read()
            print(f"Successfully read content from {full_path}. Length: {len(content)} characters.")
            return content
        except Exception as e:
            print(f"Error reading file '{full_path}': {e}")
            return f"Error: Could not read content from '{file_path}': {e}"
    else:
        print(f"File not found: {full_path}")
        return f"Error: File '{file_path}' not found in the repository."

def ask_openai(prompt, context_info=""):
    """Sends a question to OpenAI API."""
    messages = [
        {"role": "system", "content": "You are a helpful assistant for the AMRNet GitHub repository. Your goal is to answer questions about the codebase, its purpose, and help users understand specific files or concepts within AMRNet. Be concise, informative, and helpful. If a query asks for file content, explain the file."},
    ]

    if context_info:
        messages.append({"role": "user", "content": f"Here is some relevant context about the repository or requested files:\n\n{context_info}"})

    messages.append({"role": "user", "content": f"User Query: {prompt}"})

    print(f"\n--- Sending to OpenAI (Model: gpt-3.5-turbo) ---")
    # print(f"Messages: {json.dumps(messages, indent=2)}") # Uncomment for detailed prompt debugging
    print(f"--------------------------------------------------")

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo", # Use the client object for API calls
            messages=messages,
            max_tokens=500, # Adjust as needed for conciseness vs. detail
            temperature=0.7, # Balance creativity and determinism
        )
        response_text = response.choices[0].message.content.strip()
        print(f"--- Received Response from OpenAI (Length: {len(response_text)} characters) ---")
        return response_text
    except openai.APIError as e:
        print(f"OpenAI API Error: {e}")
        return f"Sorry, I encountered an API error trying to process your request: {e}"
    except Exception as e:
        print(f"An unexpected error occurred while calling OpenAI: {e}")
        return f"Sorry, I encountered an unexpected error processing your request: {e}"

def post_comment_to_issue(repo_obj, issue_num, comment_body):
    """Posts a comment to a GitHub issue."""
    try:
        issue = repo_obj.get_issue(number=issue_num)
        issue.create_comment(comment_body)
        print(f"Successfully posted comment to issue #{issue_num}.")
    except UnknownObjectException:
        print(f"Error: Issue #{issue_num} not found in repository {repo_obj.full_name}.")
    except Exception as e:
        print(f"Error posting comment to GitHub issue #{issue_num}: {e}")

def main():
    print(f"Raw comment body: {COMMENT_BODY}")

    # Remove the bot's mention from the query
    user_query = COMMENT_BODY.replace(BOT_USERNAME, "").strip()
    print(f"Cleaned user query: '{user_query}'")

    response_text = ""
    context_for_llm = ""

    # Basic command parsing
    if not user_query:
        response_text = "Hello! How can I help you with the AMRNet repository today? You can ask me things like 'What is this repository about?' or 'Explain file src/main.js'."
    elif user_query.lower().startswith("explain file"):
        try:
            file_path_to_explain = user_query.split("explain file", 1)[1].strip()
            if not file_path_to_explain:
                response_text = "Please specify which file you want me to explain. Usage: `@amr-bot explain file path/to/your/file.py`"
            else:
                file_content = get_file_content(file_path_to_explain)
                if file_content.startswith("Error:"): # Check for error string returned by get_file_content
                    response_text = file_content
                else:
                    context_for_llm = f"The user requested an explanation for the file '{file_path_to_explain}'. Here is its content:\n\n```\n{file_content}\n```\n\nBased on the content, provide a concise explanation of this file's purpose and key components relevant to the AMRNet project. Focus on what the file does within the context of the repository."
                    response_text = ask_openai(f"Explain the file '{file_path_to_explain}'", context_for_llm)
        except IndexError:
            response_text = "Please specify which file you want me to explain. Usage: `@amr-bot explain file path/to/your/file.py`"
    elif "what is this repository about" in user_query.lower() or "purpose of amrnet" in user_query.lower() or "tell me about amrnet" in user_query.lower():
        repo_overview = get_repo_overview()
        context_for_llm = f"The user is asking about the AMRNet repository. Here's a brief overview (e.g., from README):\n\n{repo_overview}"
        response_text = ask_openai("What is the AMRNet repository about?", context_for_llm)
    else:
        # Generic query - provide some general repo context to the LLM
        repo_overview_context = f"Context: This query is about the AMRNet repository. Overview:\n{get_repo_overview()}"
        response_text = ask_openai(user_query, repo_overview_context)

    # Post the response as a comment
    if response_text:
        post_comment_to_issue(repo, ISSUE_NUMBER, response_text)
    else:
        print("No response text was generated or determined.")

if __name__ == "__main__":
    main()