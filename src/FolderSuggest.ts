import { AbstractInputSuggest, App, TFolder } from 'obsidian';

export class FolderSuggest extends AbstractInputSuggest<TFolder> {
  private inputEl: HTMLInputElement;

  constructor(app: App, textInputEl: HTMLInputElement) {
    super(app, textInputEl);
    this.inputEl = textInputEl;
  }

  getSuggestions(inputStr: string): TFolder[] {
    const folders: TFolder[] = [];
    const lowerCaseInputStr = inputStr.toLowerCase();

    // 递归获取所有文件夹
    const getfolders = (folder: TFolder) => {
      // 如果文件夹名称包含输入字符串，添加到建议列表
      if (folder.path.toLowerCase().contains(lowerCaseInputStr)) {
        folders.push(folder);
      }

      // 递归处理子文件夹
      for (const child of folder.children) {
        if (child instanceof TFolder) {
          getfolders(child);
        }
      }
    };

    // 从根目录开始搜索
    const rootFolder = this.app.vault.getRoot();
    getfolders(rootFolder);

    return folders;
  }

  renderSuggestion(folder: TFolder, el: HTMLElement): void {
    el.setText(folder.path);
  }

  selectSuggestion(folder: TFolder): void {
    this.inputEl.value = folder.path;
    this.inputEl.trigger("input");
    this.close();
  }
}
