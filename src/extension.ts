import * as vscode from 'vscode';
import { GoogleGenerativeAI } from '@google/generative-ai';

export function activate(context: vscode.ExtensionContext) {
    console.log('PromptMaster Pro is active!');

    // Command 1: The Main Generator
    let generateDisposable = vscode.commands.registerCommand('promptmaster-pro.optimizeCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Please open a file and highlight some code first.');
            return;
        }

        const selection = editor.selection;
        const highlightedCode = editor.document.getText(selection);
        const fileName = editor.document.fileName.split('/').pop() || 'Unknown File';

        if (!highlightedCode) {
            vscode.window.showErrorMessage('⚠️ Please highlight some code to optimize!');
            return;
        }

        // --- SECURE STORAGE LOGIC ---
        // 1. Check the vault for the key
        let apiKey = await context.secrets.get('promptmaster-api-key');
        
        // 2. If no key is found, ask the user and save it to the vault
        if (!apiKey) {
            apiKey = await vscode.window.showInputBox({
                prompt: 'Enter your Gemini API Key (It will be securely saved in VS Code)',
                password: true,
                ignoreFocusOut: true
            });
            
            if (apiKey) {
                await context.secrets.store('promptmaster-api-key', apiKey);
            } else {
                vscode.window.showWarningMessage('An API Key is required to use PromptMaster Pro.');
                return;
            }
        }

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "PromptMaster: Engineering Master Prompt...",
            cancellable: false
        }, async (progress) => {
            try {
                const genAI = new GoogleGenerativeAI(apiKey!);
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                const devMetaPrompt = `
                You are a Senior Solutions Architect and Expert Prompt Engineer. 
                Write a highly detailed prompt for the user to paste into an AI coding tool.
                
                Context Code Snippet (${fileName}): 
                \`\`\`
                ${highlightedCode}
                \`\`\`
                
                Your generated Master Prompt MUST include:
                1. **Role & Persona**: Define the expert engineering persona.
                2. **Task Definition**: State the overarching goal based on the code provided.
                3. **Architectural Breakdown**: Detail the specific logic required.
                4. **Project Context & Non-Negotiables**: Preserve the exact code block above verbatim. Do not summarize it.
                5. **Constraints**: Provide rules for the AI's output format.
                
                Output ONLY the optimized prompt in clean Markdown.
                `;

                const result = await model.generateContent(devMetaPrompt);
                const responseText = result.response.text();

                const document = await vscode.workspace.openTextDocument({
                    content: responseText,
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(document, vscode.ViewColumn.Beside);

            } catch (error: any) {
                vscode.window.showErrorMessage(`API Error: ${error.message}`);
    
            }
        });
    });

    // Command 2: Allow the user to manually reset their API key
    let resetDisposable = vscode.commands.registerCommand('promptmaster-pro.resetApiKey', async () => {
        await context.secrets.delete('promptmaster-api-key');
        vscode.window.showInformationMessage('PromptMaster API Key successfully cleared from the vault!');
    });

    context.subscriptions.push(generateDisposable, resetDisposable);
}

export function deactivate() {}