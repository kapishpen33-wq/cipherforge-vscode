import * as vscode from 'vscode';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

export function activate(context: vscode.ExtensionContext) {
    console.log('CipherForge: Asymmetric Engine Online.');

    // --- HELPER 1: The Local RAG Engine ---
    async function getWorkspaceContext(): Promise<string> {
        if (!vscode.workspace.workspaceFolders) return 'No workspace opened.';
        let contextData = '### Global Workspace Context\n';
        let foundContext = false;

        try {
            const pkgFiles = await vscode.workspace.findFiles('package.json', '**/node_modules/**', 1);
            if (pkgFiles.length > 0) {
                const doc = await vscode.workspace.openTextDocument(pkgFiles[0]);
                const parsed = JSON.parse(doc.getText());
                const deps = Object.keys(parsed.dependencies || {}).join(', ');
                contextData += `* **Tech Stack Detected:** Node.js / NPM\n* **Active Dependencies:** ${deps || 'None explicit'}\n`;
                foundContext = true;
            }

            const pyFiles = await vscode.workspace.findFiles('requirements.txt', '**/venv/**', 1);
            if (pyFiles.length > 0) {
                const doc = await vscode.workspace.openTextDocument(pyFiles[0]);
                const lines = doc.getText().split('\n').filter(l => l.trim() !== '').slice(0, 15).join(', ');
                contextData += `* **Tech Stack Detected:** Python\n* **Active Dependencies:** ${lines || 'None explicit'}\n`;
                foundContext = true;
            }
        } catch (error) {
            console.error("CipherForge RAG Error:", error);
        }

        return foundContext ? contextData : 'No specific environment configuration files detected in workspace.';
    }

    // --- THE CORE: Asymmetric Agentic Remediation ---
    async function runAsymmetricRemediation(editor: vscode.TextEditor, workspaceContext: string) {
        const selectedCode = editor.document.getText(editor.selection);
        if (!selectedCode) return vscode.window.showErrorMessage('Highlight code to remediate.');

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `CipherForge: Executing Asymmetric Combat (Red 0.7 vs Blue 0.1)...`,
            cancellable: false
        }, async () => {
            try {
                const config = vscode.workspace.getConfiguration('cipherforge');
                const selectedGoogleModel = config.get<string>('googleModel') || 'gemini-2.5-flash';
                const selectedAnthropicModel = config.get<string>('anthropicModel') || 'claude-sonnet-4-6';

                let geminiKey = await context.secrets.get('cipherforge-gemini-key');
                if (!geminiKey) {
                    geminiKey = await vscode.window.showInputBox({ prompt: 'Enter Gemini API Key', password: true });
                    if (geminiKey) await context.secrets.store('cipherforge-gemini-key', geminiKey);
                    else return;
                }
                const genAI = new GoogleGenerativeAI(geminiKey);

                let anthropicKey = await context.secrets.get('cipherforge-anthropic-key');
                let blueTeamCode = "";

                // PHASE 1: BLUE TEAM (Defender - Deterministic 0.1)
                const bluePrompt = `You are a Principal Software Architect. Rewrite this code to be mathematically optimal, horizontally scalable, and secure against all OWASP vulnerabilities. 
                Return ONLY the raw code. No markdown formatting, no backticks, no conversational text. Just the executable code.
                ${workspaceContext}
                Target Code:\n${selectedCode}`;

                if (anthropicKey) {
                    const anthropic = new Anthropic({ apiKey: anthropicKey });
                    const claudeMsg = await anthropic.messages.create({
                        model: selectedAnthropicModel, max_tokens: 4000, temperature: 0.1,
                        messages: [{ role: "user", content: bluePrompt }]
                    });
                    blueTeamCode = claudeMsg.content.map((block: any) => block.type === 'text' ? block.text : '').join('');
                } else {
                    const blueModel = genAI.getGenerativeModel({ model: selectedGoogleModel, generationConfig: { temperature: 0.1 } });
                    const blueResult = await blueModel.generateContent(bluePrompt);
                    blueTeamCode = blueResult.response.text();
                }

                // PHASE 2: RED TEAM (Attacker - Creative 0.7)
                const redModel = genAI.getGenerativeModel({ model: selectedGoogleModel, generationConfig: { temperature: 0.7 } }); 
                const redPrompt = `You are an elite Threat Hunter and Penetration Tester. The Blue Team wrote this code. Find lateral zero-days, massive scaling bottlenecks, and edge-case exploits. 
                If it is completely bulletproof, reply ONLY with the word "SECURE". If it is vulnerable, aggressively list the exact flaws.
                Code:\n${blueTeamCode}`;
                const redResult = await redModel.generateContent(redPrompt);
                const redCritique = redResult.response.text();

                let finalCode = blueTeamCode;

                // PHASE 3: CONSENSUS REWRITE
                if (!redCritique.includes("SECURE")) {
                    vscode.window.showInformationMessage("Red Team breached defense. Forcing deterministic Blue Team rebuild...");
                    
                    const remediationPrompt = `You are the Blue Team Architect. The Red Team destroyed your code with these exploits: ${redCritique}.
                    Engineer an impregnable, enterprise-scale fix. Return ONLY the raw, executable, secure code. NO markdown formatting. NO conversational text.
                    Previous Broken Code:\n${blueTeamCode}`;

                    if (anthropicKey) {
                        const anthropic = new Anthropic({ apiKey: anthropicKey });
                        const claudeMsg = await anthropic.messages.create({
                            model: selectedAnthropicModel, max_tokens: 4000, temperature: 0.1,
                            messages: [{ role: "user", content: remediationPrompt }]
                        });
                        finalCode = claudeMsg.content.map((block: any) => block.type === 'text' ? block.text : '').join('');
                    } else {
                        const blueModel = genAI.getGenerativeModel({ model: selectedGoogleModel, generationConfig: { temperature: 0.1 } });
                        const blueResult = await blueModel.generateContent(remediationPrompt);
                        finalCode = blueResult.response.text();
                    }
                }

                const cleanCode = finalCode.replace(/```[a-z]*\n/gi, '').replace(/```/gi, '').trim();

                const edit = new vscode.WorkspaceEdit();
                edit.replace(editor.document.uri, editor.selection, cleanCode);
                await vscode.workspace.applyEdit(edit);
                
                vscode.window.showInformationMessage('✅ Asymmetric Consensus Reached. Code Remediated.');

            } catch (error: any) {
                vscode.window.showErrorMessage(`CipherForge System Failure: ${error.message}`);
            }
        });
    }

    // --- COMMAND REGISTRATION ---
    let remediateCmd = vscode.commands.registerCommand('cipherforge.remediate', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        const globalContext = await getWorkspaceContext();
        await runAsymmetricRemediation(editor, globalContext);
    });

    let resetCmd = vscode.commands.registerCommand('cipherforge.resetKeys', async () => {
        await context.secrets.delete('cipherforge-gemini-key');
        await context.secrets.delete('cipherforge-anthropic-key');
        vscode.window.showInformationMessage('CipherForge: Vault Keys Purged.');
    });

    context.subscriptions.push(remediateCmd, resetCmd);
}

export function deactivate() {}