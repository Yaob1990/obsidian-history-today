import { App, Plugin, TFile, Notice, Modal, MarkdownView, PluginSettingTab, Setting } from 'obsidian';
import dayjs from 'dayjs';
import { Translator } from './i18n/translator';
import { FolderSuggest } from './FolderSuggest';

interface HistoricalNotesSettings {
  language: string;
  folderPath: string; // 新增文件夹路径设置
  lastCheckDate: string; // 添加最后检查日期
}

const DEFAULT_SETTINGS: HistoricalNotesSettings = {
  language: 'auto',
  folderPath: '/', // 默认为根目录
  lastCheckDate: '', // 默认为空
};

export default class HistoricalNotesPlugin extends Plugin {
  settings: HistoricalNotesSettings;
  private translator: Translator;

  async onload() {
    // 首先创建 translator 实例
    this.translator = new Translator();

    // 然后加载设置
    await this.loadSettings();

    // 添加功能按钮到左侧功能区
    this.addRibbonIcon('gem', this.translator.t('ribbon.tooltip'), () => {
      this.showHistoricalNotes();
    });

    // 添加命令到命令面板
    this.addCommand({
      id: 'show-historical-notes',
      name: this.translator.t('command.name'),
      callback: () => {
        this.showHistoricalNotes();
      },
    });

    this.addSettingTab(new HistoricalNotesSettingTab(this.app, this));

    // 修改每日检查的调用方式
    this.app.workspace.onLayoutReady(() => {
      this.checkDailyNotes();
    });
  }

  async checkDailyNotes() {
    const today = dayjs().format('YYYY-MM-DD');

    // 如果最后检查日期不是今天，则显示通知
    if (this.settings.lastCheckDate !== today) {
      const currentMonth = dayjs().month() + 1;
      const currentDay = dayjs().date();

      const historicalNotes = this.findHistoricalNotes(currentMonth, currentDay);
      if (historicalNotes.length) {
        const notice = new Notice(
          this.translator.t('notice.daily_reminder'),
          10000 // 显示10秒
        );

        // 添加点击事件
        // @ts-ignore
        notice.noticeEl.addEventListener('click', () => {
          this.showHistoricalNotes();
          notice.hide();
        });
      }

      // 更新最后检查日期
      this.settings.lastCheckDate = today;
      await this.saveSettings();
    }
  }

  async showHistoricalNotes() {
    const today = dayjs();
    const currentMonth = today.month() + 1;
    const currentDay = today.date();

    const historicalNotes = this.findHistoricalNotes(currentMonth, currentDay);

    console.log('showHistoricalNotes historicalNotes', historicalNotes);
    if (historicalNotes.length > 0) {
      new HistoricalNotesModal(this.app, historicalNotes, this.translator).open();
    } else {
      new Notice(this.translator.t('notice.no_notes'));
    }
  }

  findHistoricalNotes(month: number, day: number): TFile[] {
    const files = this.app.vault.getFiles().filter((file) => {
      const isInFolder = this.settings.folderPath === '/' || file.path.startsWith(this.settings.folderPath);
      if (!isInFolder || file.extension !== 'md') return false;

      // 优先检查 frontmatter 中的 date created
      const cache = this.app.metadataCache.getFileCache(file);
      const frontmatter = cache?.frontmatter;
      const dateCreated = frontmatter?.['date created'];

      let creationDate;
      if (dateCreated) {
        creationDate = dayjs(dateCreated);
      } else {
        // 如果没有 date created，则使用 ctime
        creationDate = dayjs(file.stat.ctime);
      }

      const creationMonth = creationDate.month() + 1;
      const creationDay = creationDate.date();
      return creationMonth === month && creationDay === day;
    });

    // 排序时也使用相同的逻辑
    return files.sort((a, b) => {
      const getCreationTime = (file: TFile) => {
        const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;
        const dateCreated = frontmatter?.['date created'];
        return dateCreated ? dayjs(dateCreated).valueOf() : file.stat.ctime;
      };

      return getCreationTime(b) - getCreationTime(a);
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    // 确保 translator 存在后再设置语言
    if (this.settings.language !== 'auto') {
      this.translator.setLocale(this.settings.language);
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class HistoricalNotesModal extends Modal {
  constructor(app: App, private notes: TFile[], private translator: Translator) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: this.translator.t('modal.title') });

    const container = contentEl.createDiv('historical-notes-container');

    for (const note of this.notes) {
      const noteDiv = container.createDiv('historical-note');

      // 创建笔记标题
      const title = noteDiv.createEl('h3');
      title
        .createEl('a', {
          text: note.basename,
          href: '#',
        })
        .addEventListener('click', async (e) => {
          e.preventDefault();

          console.log('note', note);
          // const leaf = this.app.workspace.getLeaf(false);
          // await leaf.openFile(note);
          // await this.app.workspace.openLinkText(note.basename, '', true);
          this.openFile(note.basename);
          this.close();
        });

      // 显示创建日期
      noteDiv.createEl('p', {
        text: `${this.translator.t('note.created_at')}${dayjs(note.stat.ctime).format('YYYY-MM-DD')}`,
      });
    }
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }

  openFile(fileName: string) {
    let found = false;
    this.app.workspace.iterateAllLeaves((leaf) => {
      const file: TFile = leaf.view instanceof MarkdownView ? leaf.view.file : null;
      if (file?.path === fileName) {
        this.app.workspace.revealLeaf(leaf);
        if (leaf.view instanceof MarkdownView) {
          leaf.view.editor.focus();
        }
        found = true;

        // console.log('FOUND A LEAF!', leaf);
        return; // don't keep looking
      }
    });

    // Case: there isn't already a tab open with this file
    if (!found) {
      this.app.workspace.openLinkText(fileName, '', true);
    }
  }
}

class HistoricalNotesSettingTab extends PluginSettingTab {
  plugin: HistoricalNotesPlugin;

  constructor(app: App, plugin: HistoricalNotesPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    // @ts-expect-error
    const t = (key: TranslationKey) => this.plugin.translator.t(key);

    containerEl.empty();

    new Setting(containerEl)
      .setName(t('settings.language.name'))
      .setDesc(t('settings.language.desc'))
      .addDropdown((dropdown) =>
        dropdown
          .addOption('auto', t('settings.language.auto'))
          .addOption('zh-CN', '中文')
          .addOption('en', 'English')
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value;
            // 更新翻译器的语言设置
            (this.plugin as any).translator.setLocale(value === 'auto' ? window.navigator.language : value);
            await this.plugin.saveSettings();

            // 更新功能区按钮的提示文本
            // @ts-expect-error
            const ribbonIcons = this.plugin.app.workspace.leftRibbon.items;
            const pluginIcon = ribbonIcons.find((icon) => icon.class === 'calendar-with-checkmark');
            if (pluginIcon) {
              // @ts-expect-error
              pluginIcon.setTooltip(this.plugin.translator.t('ribbon.tooltip'));
            }

            // 刷新设置页面以显示新语言
            this.display();
          })
      );

    new Setting(containerEl)
      .setName(t('settings.searchFolder.name'))
      .setDesc(t('settings.searchFolder.desc'))
      .addText((text) => {
        text.setPlaceholder(t('settings.searchFolder.placeholder'));
        text.setValue(this.plugin.settings.folderPath);

        new FolderSuggest(this.app, text.inputEl);

        text.onChange(async (value) => {
          this.plugin.settings.folderPath = value.endsWith('/') ? value : value + '/';
          await this.plugin.saveSettings();
        });
      });
  }
}
