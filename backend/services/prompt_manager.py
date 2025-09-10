import json
import os

PROMPTS_PATH = "prompts.json"

def load_prompts():
    if not os.path.exists(PROMPTS_PATH):
        return {}
    with open(PROMPTS_PATH, "r") as f:
        return json.load(f)

def save_prompts(prompts):
    with open(PROMPTS_PATH, "w") as f:
        json.dump(prompts, f, indent=2)
