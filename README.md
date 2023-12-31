# Blur Menu Extension

Enhance your UI experience by applying a blur effect to the menu with this extension.

## Usage Instructions

### Installation Steps
1. Activate the command palette using `Ctrl + Shift + P`.
2. Type "Blur Menu - Enable Blur" and select it.
3. Input the desired blur level (16 is recommended).
4. (Optional) Enable animations in VSCode
5. Restart Visual Studio Code to apply changes.
6. Navigate to `settings.json` in VS Code.
7. Incorporate the following transparency settings for your theme:

```json
"workbench.colorCustomizations": {
    "menu.background": "#2e333b70", //context menu
    "menu.selectionBackground": "#4247509a", //context menu hover
    "editorWidget.background": "#51586320", //widget and tooltip
    "quickInput.background": "#2e333b00", //command center drop down menu
    "notifications.background": "#29303bd7", //Notification background color.
}
```

> **Tip:** The above configuration is tailored for the [Dreamweaver Dark Theme](https://marketplace.visualstudio.com/items?itemName=Gaga-Dev.dreamweaver-dark-theme) you can setup color for your theme as you like.

### Removal Process
1. Open the command palette with `Ctrl + Shift + P`.
2. Search and execute "Blur Menu - Disable & Restore setting".
3. Restart VS Code to revert to default settings.

## Preview
![UI Preview](images/image.png "User Interface with Blur Effect")
![UI Preview](images/animation.gif "Animation User Interface with Blur Effect")

