import os
import openai
from github import Github

# --- Configuration ---
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
REPO_FULL_NAME = os.environ.get("REPO_FULL_NAME")
ISSUE_NUMBER = int(os.environ.get("ISSUE_NUMBER"))
COMMENT_BODY = os.environ.get("COMMENT_BODY")
# COMMENT_ID = int(os.environ.get("COMMENT_ID")) # If you want to react to the original comment

BOT_USERNAME = "@amr-bot" # The username you chose for your bot trigger

if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY not found.")
    exit(1)
if not GITHUB_TOKEN:
    print("Error: GITHUB_TOKEN not found.")
    exit(1)

openai.api_key = OPENAI_API_KEY

def get_repo_overview():
    """
    Fetches a brief overview of the repository.
    For amrnet, this could be the README content or a hardcoded summary.
    """
    try:
        with open("README.md", "r", encoding="utf-8") as f:
            readme_content = f.read()
        # Return first N lines or a summary
        return "\n".join(readme_content.splitlines()[:30]) # First 30 lines
    except FileNotFoundError:
        return "AMRNet is a project focused on Adaptive Mesh Refinement. (README.md not found for more details)."
    except Exception as e:
        return f"Error reading README: {e}"


def get_file_content(file_path):
    """Fetches the content of a specific file from the repository."""
    try:
        # Sanitize file_path to prevent directory traversal - basic example
        if ".." in file_path:
            return "Error: Invalid file path."
        # Make sure it's relative to the repo root
        if file_path.startswith("/"):
            file_path = file_path[1:]

        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return f"Error: File '{file_path}' not found."
    except Exception as e:
        return f"Error reading file '{file_path}': {e}"

def ask_openai(prompt, context=""):
    """Sends a question to OpenAI API."""
    full_prompt = f"{context}\n\nUser Query: {prompt}\n\nBot Response:"
    print(f"--- Sending to OpenAI ---\n{full_prompt}\n-------------------------")
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo", # Or "gpt-4" if you have access and budget
            messages=[
                {"role": "system", "content": "You are a helpful assistant for the AMRNet GitHub repository. Your goal is to answer questions about the codebase, its purpose, and help users understand specific files or concepts within AMRNet. Be concise and informative."},
                {"role": "user", "content": f"{context}\n\nUser Query: {prompt}"}
            ],
            max_tokens=500, # Adjust as needed
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        return f"Sorry, I encountered an error trying to process your request: {e}"

def post_comment_to_issue(repo_name, issue_num, comment_body):
    """Posts a comment to a GitHub issue."""
    try:
        g = Github(GITHUB_TOKEN)
        repo = g.get_repo(repo_name)
        issue = repo.get_issue(number=issue_num)
        issue.create_comment(comment_body)
        print(f"Successfully posted comment to issue #{issue_num}")
    except Exception as e:
        print(f"Error posting comment to GitHub: {e}")

def main():
    user_query = COMMENT_BODY.replace(BOT_USERNAME, "").strip()
    print(f"Received query: {user_query}")

    # Basic command parsing
    if not user_query:
        response_text = "Hello! How can I help you with the AMRNet repository today?"
    elif user_query.lower().startswith("explain file"):
        try:
            file_path_to_explain = user_query.split("explain file", 1)[1].strip()
            if not file_path_to_explain:
                response_text = "Please specify which file you want me to explain. Usage: `@amr-bot explain file path/to/your/file.py`"
            else:
                print(f"Attempting to explain file: {file_path_to_explain}")
                file_content = get_file_content(file_path_to_explain)
                if file_content.startswith("Error:"):
                    response_text = file_content
                else:
                    context_for_llm = f"The user wants an explanation of the file '{file_path_to_explain}'. Here is its content:\n\n```\n{file_content}\n```\n\nProvide a concise explanation of this file's purpose and key components relevant to the AMRNet project."
                    response_text = ask_openai(f"Explain the file '{file_path_to_explain}'", context_for_llm)
        except IndexError:
            response_text = "Please specify which file you want me to explain. Usage: `@amr-bot explain file path/to/your/file.py`"

    elif "what is this repository about" in user_query.lower() or "purpose of amrnet" in user_query.lower():
        repo_overview = get_repo_overview()
        context_for_llm = f"The user is asking about the AMRNet repository. Here's some information (e.g., from README):\n{repo_overview}"
        response_text = ask_openai("What is the AMRNet repository about?", context_for_llm)
    else:
        # Generic query
        repo_overview_context = f"Context: This query is about the AMRNet repository. Overview:\n{get_repo_overview()}"
        response_text = ask_openai(user_query, repo_overview_context)

    if response_text:
        post_comment_to_issue(REPO_FULL_NAME, ISSUE_NUMBER, response_text)
    else:
        print("No response generated.")

if __name__ == "__main__":
    main()