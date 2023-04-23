const vscode = require('vscode');

function activate() {
	console.log('Started');
	const branchData = {}
	const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports?.getAPI(1)

	const saveTabs = async(currentBranch) => {
		const tabs = await vscode.window.tabGroups.all.flatMap(({ tabs }) => tabs.map(tab => (
			{
				path: tab.input.uri.path,
				viewColumn: tab.group.viewColumn
			}
		)))
		branchData[currentBranch] = tabs
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
				await new Promise(resolve => setTimeout(resolve, 500));
			}
		}
	}

	const closeTabs = () => {
		const tabs = vscode.window.tabGroups.all.flatMap(({ tabs }) => tabs)
		tabs.forEach(async(tab) => {
			await vscode.window.tabGroups.close(tab)
		})
	}

	const trackGitChanges = () => {
		const gitRepository = gitExtension?.repositories[0]?.repository
		console.log("Repositories", gitExtension?.repositories)
		gitRepository.onDidChangeOperations(async(e) => {
				if(e === 'Checkout'){
						saveTabs(gitRepository.HEAD.name)
						closeTabs()
				}
				if(e.operation?.kind === 'Checkout'){
						restoreTabs(e.operation?.refLabel)
				}
		});
	}

	if(gitExtension?.state === 'initialized'){
		trackGitChanges()
	} else {
		gitExtension?.onDidChangeState((e) => {
				if(e === 'initialized'){
					trackGitChanges()
				}
		})
	}

	if (gitExtension?.state === 'initialized' && gitExtension?.repositories.length <= 0) {
		vscode.window.showErrorMessage('Unable to find Repo. Please add Repo to your current or parent directory');
	}
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
