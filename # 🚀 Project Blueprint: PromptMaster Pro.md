# 🚀 Project Blueprint: PromptMaster Pro (VS Code Extension)

## 🎯 The Core Mission
To build a frictionless, AI-native VS Code extension that eliminates "Context Decay" and "Copy-Paste Fatigue." It allows developers to highlight messy code, right-click, and instantly generate a hyper-structured "Master Prompt" containing explicit roles, architectural breakdowns, and strict constraints (preserving load-bearing code snippets).

## 💰 Monetization Strategy
* **Phase 1 (Growth & Validation):** BYOK (Bring Your Own Key) model. Free on the VS Code Marketplace. Users input their own Gemini API key, stored securely in local extension secrets.
* **Phase 2 (SaaS Paywall):** Remove BYOK. Route requests through a secure Node.js/Firebase backend. Implement Stripe. Users get 5 free runs, then pay $9/month for frictionless native IDE integration.

## 🏗️ Technical Architecture (TypeScript / Webpack)
The extension is built on an Event-Driven Architecture divided into 5 core modules:
1.  **The Controller (`src/extension.ts`):** The main entry point. Registers commands and listens for user events (like right-clicks).
2.  **The Context Manager (`src/utils/editor.ts`):** Uses the VS Code API to silently grab highlighted text and file names.
3.  **The AI Engine (`src/geminiService.ts`):** Handles the `@google/generative-ai` SDK integration, passes the context into the Meta-Prompt, and manages chat history.
4.  **The UI Layer (`src/webview/SidebarProvider.ts`):** A custom HTML/CSS Webview panel living in the VS Code sidebar to display the output and handle Day 2 refinements.
5.  **The Vault (`SecretStorage`):** Uses VS Code's native `context.secrets` API to securely encrypt the user's API key.

## 🧠 The Core Logic (The Meta-Prompt to Port to TypeScript)
This is the core "Brain" we are migrating from the Python MVP to the TypeScript AI Engine:

> "You are a Senior Solutions Architect and Expert Prompt Engineer. 
> Write a highly detailed prompt for the user to paste into their target AI coding tool (like Claude, ChatGPT, or Cursor).
> 
> Goal/Brain Dump: [USER_INTENT]
> Context Code Snippet ([FILE_NAME]): 
> ```
> [HIGHLIGHTED_CODE]
> ```
> 
> Your generated Master Prompt MUST include:
> 1. **Role & Persona**: Define the expert engineering persona.
> 2. **Task Definition**: Clearly state the overarching goal.
> 3. **Architectural Breakdown**: Detail the specific features and logic required.
> 4. **Strict Technical Preservation**: You MUST create a dedicated section called 'Project Context & Non-Negotiables'. Preserve the exact details and code blocks verbatim. Do not summarize their code; force the target AI to use it exactly as written.
> 5. **Constraints**: Provide rules for the AI's output format.
> 
> Output ONLY the optimized prompt in clean Markdown."

## 📍 Current Status
* [x] Node.js environment configured.
* [x] Yeoman & VS Code Generator installed.
* [x] Base TypeScript scaffolding created (`yo code`).
* [x] Extension Host "Hello World" successfully tested.
* [ ] Install Gemini SDK (`npm install @google/generative-ai`).
* [ ] Rewrite `extension.ts` to trigger the AI engine instead of a basic notification.