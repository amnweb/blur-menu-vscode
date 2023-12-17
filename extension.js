const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const appDir = path.dirname(require.main.filename);
const appRoot = vscode.env.appRoot;
const productFile = path.join(appRoot, "product.json");
const origFile = `${productFile}.orig.${vscode.version}`;

const workbenchCssPath = path.join(
	appRoot,
	"out",
	"vs",
	"workbench",
	"workbench.desktop.main.css"
);
const workbenchJsPath = path.join(
	appRoot,
	"out",
	"vs",
	"workbench",
	"workbench.desktop.main.js"
);

function applyChecksum() {
	const product = require(productFile);
	let changed = false;
	for (const [filePath, curChecksum] of Object.entries(product.checksums)) {
		const checksum = computeChecksum(
			path.join(appDir, ...filePath.split("/"))
		);
		if (checksum !== curChecksum) {
			product.checksums[filePath] = checksum;
			changed = true;
		}
	}
	if (changed) {
		const json = JSON.stringify(product, null, "\t");
		try {
			if (!fs.existsSync(origFile)) {
				fs.renameSync(productFile, origFile);
			}
			fs.writeFileSync(productFile, json, { encoding: "utf8" });
		} catch (err) {
			console.error(err);
		}
	}
}
function restoreChecksum() {
	try {
		if (fs.existsSync(origFile)) {
			fs.unlinkSync(productFile);
			fs.renameSync(origFile, productFile);
		}
	} catch (err) {
		console.error(err);
	}
}

function computeChecksum(file) {
	var contents = fs.readFileSync(file);
	return crypto
		.createHash("md5")
		.update(contents)
		.digest("base64")
		.replace(/=+$/, "");
}
function cleanupOrigFiles() {
	// Remove all old backup files
	const oldOrigFiles = fs
		.readdirSync(appRoot)
		.filter((file) => /\.orig\./.test(file))
		.filter((file) => !file.endsWith(vscode.version));
	for (const file of oldOrigFiles) {
		fs.unlinkSync(path.join(appRoot, file));
	}
}

function createBackup(filePath) {
	const backupPath = `${filePath}.backup`;
	if (!fs.existsSync(backupPath)) {
		fs.copyFileSync(filePath, backupPath);
	}
}

function restoreFromBackup(filePath,msgShow = true) {
	const backupPath = `${filePath}.backup`;
	if (fs.existsSync(backupPath)) {
		fs.copyFileSync(backupPath, filePath);
		if(msgShow){
			vscode.window.showInformationMessage(
				`Settings restored, Restart VS Code to see changes.`
			);
		}
	} else {
		if(msgShow){
			vscode.window.showInformationMessage(`Backup files not found`);
		}
	}
}

function activate(context) {
	const changeSystem = "blur-menu.modifyFiles";
	const restoreSystem = "blur-menu.restoreSettings";
	const modifyDisposable = vscode.commands.registerCommand(
		changeSystem,
		async () => {
			const blurThreshold = await vscode.window.showInputBox({
				placeHolder: "Enter blur level",
				prompt: "Type the blur level that is between 0 and 24 (recommended: 16)\n",
			});

			if (!blurThreshold) {
				vscode.window.showInformationMessage(
					"No blur level entered. No changes applied."
				);
			} else {
				restoreFromBackup(workbenchCssPath,false);
				createBackup(workbenchCssPath);
				createBackup(workbenchJsPath);
				
				const newLineContent =
					`.action-widget:after,.context-view.top.left:after,.overflowingContentWidgets>div:after,.workbench-hover-container:after,.find-widget:after,.monaco-menu:after,.shadow-root-host::part(menu)::after,.quick-input-widget:after{z-index:-1;content:'';position:absolute;left:0;top:0;bottom:0;right:0;backdrop-filter:blur(`+blurThreshold+`px)}`;
				// Update workbench.desktop.main.css file
				const cssFileContent = fs.readFileSync(workbenchCssPath,"utf-8");
				const modifiedCssContent = cssFileContent + newLineContent;
				fs.writeFileSync(workbenchCssPath, modifiedCssContent, "utf-8");

				// Update workbench.desktop.main.js file
				const jsFileContent = fs.readFileSync(workbenchJsPath, "utf-8");
				if (!jsFileContent.includes('T.classList.add("monaco-menu"),T.setAttribute("role","presentation"),T.setAttribute("part","menu")')) {
					const modifiedJsContent = jsFileContent.replace(
						/T\.classList\.add\("monaco-menu"\),T\.setAttribute\("role","presentation"\)/g,
						'T.classList.add("monaco-menu"),T.setAttribute("role","presentation"),T.setAttribute("part","menu")'
					);
					fs.writeFileSync(workbenchJsPath, modifiedJsContent, "utf-8");
				};
				
				cleanupOrigFiles();
				applyChecksum();
				vscode.window.showInformationMessage(
					"Restart VS Code to see changes."
				);
			}
		}
	);

	const restoreDisposable = vscode.commands.registerCommand(
		restoreSystem,
		() => {
			// Restore files from backups
			restoreFromBackup(workbenchCssPath);
			restoreFromBackup(workbenchJsPath);
			restoreChecksum();
		}
	);
	context.subscriptions.push(modifyDisposable, restoreDisposable);
}

exports.activate = activate;
