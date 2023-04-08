const vscode = require('vscode');
const simpleGit = require('simple-git')
	// @ts-ignore
const git = simpleGit();

async function checkRepoExists() {
	const isRepo = await new Promise((resolve, reject) => {
		git.checkIsRepo((err, isRepo) => {
			if (err) {
				reject(err);
			} else {
				resolve(isRepo);
			}
		});
	});
	return isRepo;
}

async function getAllBranches() {
	const branches = await new Promise((resolve, reject) => {
		git.branchLocal((err, branches) => {
			if (err) {
				console.log(err)
				reject(err);
			} else {
				resolve(branches.all);
			}
		});
	});
	return branches;
}

async function activate(context) {
	console.log('Congratulations, your extension "branch-stasher" is now active!');
	// @ts-ignore
	const isRepo = await checkRepoExists().catch((err) => {
		console.log(err)
		return null
	})
	const branches = await getAllBranches().catch((err) => {
		console.log(err)
		return null
	})
	console.log(branches)

	let disposable = vscode.commands.registerCommand('branch-stasher.start', function () {
		if (isRepo) {
			vscode.window.showInformationMessage('Successfully persisted your files for current branch');
		} else {
			vscode.window.showErrorMessage('Unable to find Repo. Please add Repo to your current or parent directory');

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
