const vscode = require('vscode');

function activate(context) {
	console.log('Started');

	const branchData = {}
	const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports
	const gitRepository = gitExtension?.getAPI(1).repositories[0].repository

	const saveTabs = (currentBranch) => {
		const tabs = vscode.window.tabGroups.all.flatMap(({ tabs }) => tabs.map(tab => (
			{
				path: tab.input.uri.path,
				viewColumn: tab.group.viewColumn
			}
		)))
		branchData[currentBranch] = tabs
		return JSON.stringify(branchData)
	}

	const restoreTabs = (currentBranch) => {
		if(currentBranch in branchData){
			const tabs = branchData[currentBranch]
			tabs.forEach(async(tab) => {
				console.log(tab.path)
				await vscode.window.showTextDocument(
					vscode.Uri.file(tab.path),
					{
						preview: false,
						viewColumn: tab.viewColumn
					}
				)
			})
		}
	}

	const closeTabs = () => {
		const tabs = vscode.window.tabGroups.all.flatMap(({ tabs }) => tabs)
		tabs.forEach((tab) => {
			vscode.window.tabGroups.close(tab)
		})
	}

	gitRepository.onDidChangeOperations((e) => {
		if(e === 'Checkout'){
			saveTabs(gitRepository.HEAD.name)
			closeTabs()
		}
		if(e.operation?.kind === 'Checkout'){
			restoreTabs(e.operation?.refLabel)
		}
	});

	let disposable = vscode.commands.registerCommand('branch-stasher.start', function () {
		if (gitExtension?.getAPI(1).repositories.length < 0) {
			vscode.window.showErrorMessage('Unable to find Repo. Please add Repo to your current or parent directory');
		} else {
			vscode.window.showInformationMessage('Successfully persisted your files for current branch');
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
