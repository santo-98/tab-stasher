const vscode = require('vscode');

function activate(context) {
	console.log('Congratulations, your extension "branch-stasher" is now active!');

	const configData = {}
	const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports
	const gitRepository = gitExtension?.getAPI(1).repositories[0].repository
	const currentBranch = gitRepository.HEAD.name

	const saveTabs = () => {
		const tabs = vscode.window.tabGroups.all.flatMap(({ tabs }) => tabs.map(tab => (
			{
				path: tab.input.uri.path,
				viewColumn: tab.group.viewColumn
			}
		)))
		configData[currentBranch] = tabs
		return JSON.stringify(configData)
	}

	gitRepository.onDidChangeOperations((e) => {
		console.log(e)

		if(e==="Checkout"){
			console.log(`branch changed`);
			saveTabs()
		}
	});

	// const restoreTabs = async () => {
	// 	vscode.window.tabGroups.all.flatMap(({ tabs }) => tabs.forEach(async(tab) => {
	// 		await vscode.window.showTextDocument(tab.input.uri.path)
	// 		console.log(tab.input.uri.path)
	// 		console.log(tab.group.viewColumn)
	// 	}))
	// 	// await vscode.window.showTextDocument(await vscode.window.tabGroups.all[0].tabs[0].input.uri.path, {preview: false, viewColumn: 2})
	// }
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
