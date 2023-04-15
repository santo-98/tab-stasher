import {extensions, window, Uri} from 'vscode';

function activate() {
	console.log('Started');

	const branchData = {}
	const gitExtension = extensions.getExtension('vscode.git')?.exports
	const gitRepository = gitExtension?.getAPI(1).repositories[0].repository

	const saveTabs = (currentBranch) => {
		const tabs = window.tabGroups.all.flatMap(({ tabs }) => tabs.map(tab => (
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
				await window.showTextDocument(
					Uri.file(tab.path),
					{
						preview: false,
						viewColumn: tab.viewColumn
					}
				)
			})
		}
	}

	const closeTabs = () => {
		const tabs = window.tabGroups.all.flatMap(({ tabs }) => tabs)
		tabs.forEach((tab) => {
			window.tabGroups.close(tab)
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

	if (gitExtension?.getAPI(1).repositories.length < 0) {
		window.showErrorMessage('Unable to find Repo. Please add Repo to your current or parent directory');
	}
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
