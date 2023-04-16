const vscode = require('vscode');

function activate() {
	console.log('Started');
	const branchData = {}
	const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports

	const saveTabs = async(currentBranch) => {
		const tabs = await vscode.window.tabGroups.all.flatMap(({ tabs }) => tabs.map(tab => (
			{
				path: tab.input.uri.path,
				viewColumn: tab.group.viewColumn
			}
		)))
		branchData[currentBranch] = tabs
		return JSON.stringify(branchData)
	}

	const restoreTabs = async(currentBranch) => {
		if(currentBranch in branchData){
			const tabs = branchData[currentBranch]
			for (const tab of tabs) {
				await vscode.commands.executeCommand(
					'vscode.open',
					vscode.Uri.file(tab.path),
					{ preview: false, viewColumn: tab.viewColumn }
				);
			}
		}
	}

	const closeTabs = () => {
		const tabs = vscode.window.tabGroups.all.flatMap(({ tabs }) => tabs)
		tabs.forEach((tab) => {
			vscode.window.tabGroups.close(tab)
		})
	}

	gitExtension?.getAPI(1).onDidChangeState((e) => {
		if(e === 'initialized'){
			const gitRepository = gitExtension?.getAPI(1).repositories[0]?.repository
			gitRepository.onDidChangeOperations(async(e) => {
				console.log(e)
				if(e === 'Checkout'){
					saveTabs(gitRepository.HEAD.name)
					closeTabs()
				}
				if(e.operation?.kind === 'Checkout'){
					restoreTabs(e.operation?.refLabel)
				}
			});
		}
	})

	if (gitExtension?.getAPI(1).state === 'initialized' && gitExtension?.getAPI(1).repositories.length <= 0) {
		vscode.window.showErrorMessage('Unable to find Repo. Please add Repo to your current or parent directory');
	}
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
