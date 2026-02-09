// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// 1. Register Sidebar Provider
	const shortcutProvider = new ShortcutProvider();
	vscode.window.registerTreeDataProvider('devmamudul-shortcuts', shortcutProvider);

	// 2. Create Status Bar Item
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'devmamudulsetup.showMenu';
	statusBarItem.text = '$(zap) DevMamudul';
	statusBarItem.tooltip = 'Click to open DevMamudul Menu';
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);

	// 3. Register Commands
	context.subscriptions.push(
		vscode.commands.registerCommand('devmamudulsetup.helloWorld', () => {
			vscode.window.showInformationMessage('Welcome to DevMamudul Setup! 🚀');
		}),
		vscode.commands.registerCommand('devmamudulsetup.openSettings', () => {
			vscode.commands.executeCommand('workbench.action.openSettingsJSON');
		}),
		vscode.commands.registerCommand('devmamudulsetup.openTheme', () => {
			vscode.commands.executeCommand('workbench.action.selectTheme');
		}),
		vscode.commands.registerCommand('devmamudulsetup.showWalkthrough', () => {
			vscode.commands.executeCommand('workbench.action.openWalkthrough', 'devmamudulsetup.devmamudul-welcome', false);
		}),
		vscode.commands.registerCommand('devmamudulsetup.toggleSounds', () => {
			const config = vscode.workspace.getConfiguration('devmamudulsetup');
			const currentState = config.get<boolean>('enableSounds');
			config.update('enableSounds', !currentState, vscode.ConfigurationTarget.Global);
			vscode.window.showInformationMessage(`Typing sounds ${!currentState ? 'Enabled' : 'Disabled'}`);
		}),
		vscode.commands.registerCommand('devmamudulsetup.testSound', () => {
			playSound();
			vscode.window.showInformationMessage('Playing test sound... 🔊');
		}),
		vscode.commands.registerCommand('devmamudulsetup.showMenu', async () => {
			const config = vscode.workspace.getConfiguration('devmamudulsetup');
			const soundsEnabled = config.get<boolean>('enableSounds');

			const options = [
				{ label: '$(gear) Open User Settings', command: 'devmamudulsetup.openSettings' },
				{ label: '$(paintcan) Switch Theme', command: 'devmamudulsetup.openTheme' },
				{ label: soundsEnabled ? '$(unmute) Disable Sounds' : '$(mute) Enable Sounds', command: 'devmamudulsetup.toggleSounds' },
				{ label: '$(megaphone) Test Sound', command: 'devmamudulsetup.testSound' },
				{ label: '$(mortar-board) Show Walkthrough', command: 'devmamudulsetup.showWalkthrough' },
				{ label: '$(rocket) Welcome Message', command: 'devmamudulsetup.helloWorld' }
			];

			const selected = await vscode.window.showQuickPick(options, {
				placeHolder: 'DevMamudul Setup Menu'
			});

			if (selected) {
				vscode.commands.executeCommand(selected.command);
			}
		})
	);

	// 4. Typing Sounds Listener
	let lastPlayTime = 0;
	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument((_e) => {
			const config = vscode.workspace.getConfiguration('devmamudulsetup');
			if (!config.get<boolean>('enableSounds')) { return; }

			const now = Date.now();
			if (now - lastPlayTime > 60) { // Slight increase in throttle for better feel
				lastPlayTime = now;
				playSound();
			}
		})
	);
}

function playSound() {
	const cp = require('child_process');
	// Try multiple possible Windows system sounds just in case one is missing
	const sounds = [
		'C:\\Windows\\Media\\Windows Navigation Start.wav',
		'C:\\Windows\\Media\\Speech On.wav',
		'C:\\Windows\\Media\\notify.wav',
		'C:\\Windows\\Media\\chord.wav'
	];
	
	// Create a powershell command that checks for existence before playing
	const psCommand = `
		$sounds = @('${sounds.join("','")}');
		foreach ($s in $sounds) {
			if (Test-Path $s) {
				(New-Object Media.SoundPlayer $s).Play();
				break;
			}
		}
	`.replace(/\n/g, '');

	cp.exec(`powershell -c "${psCommand}"`);
}


class ShortcutProvider implements vscode.TreeDataProvider<ShortcutItem> {
	getTreeItem(element: ShortcutItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: ShortcutItem): Thenable<ShortcutItem[]> {
		if (element) {
			return Promise.resolve([]);
		} else {
			return Promise.resolve([
				new ShortcutItem('Open User Settings', vscode.TreeItemCollapsibleState.None, {
					command: 'devmamudulsetup.openSettings',
					title: 'Open Settings'
				}),
				new ShortcutItem('Switch Color Theme', vscode.TreeItemCollapsibleState.None, {
					command: 'devmamudulsetup.openTheme',
					title: 'Switch Theme'
				}),
				new ShortcutItem('Toggle Typing Sounds', vscode.TreeItemCollapsibleState.None, {
					command: 'devmamudulsetup.toggleSounds',
					title: 'Toggle Sounds'
				}),
				new ShortcutItem('Show Walkthrough', vscode.TreeItemCollapsibleState.None, {
					command: 'devmamudulsetup.showWalkthrough',
					title: 'Show Walkthrough'
				}),
				new ShortcutItem('Show Welcome Message', vscode.TreeItemCollapsibleState.None, {
					command: 'devmamudulsetup.helloWorld',
					title: 'Show Welcome'
				})
			]);
		}
	}
}

class ShortcutItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);
		this.contextValue = 'shortcutItem';
		this.iconPath = new vscode.ThemeIcon('zap');
	}
}


// This method is called when your extension is deactivated
export function deactivate() {}
