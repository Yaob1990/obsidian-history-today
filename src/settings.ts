import { App, PluginSettingTab, Setting } from 'obsidian';

// 添加插件接口定义
interface HistoricalNotesPlugin {
  settings: {
    language: string;
    searchFolder: string;
  };
  translator: {
    t: (key: string) => string;
    getLocale: () => string;
    setLocale: (locale: string) => void;
  };
  saveSettings: () => Promise<void>;
}

export class HistoricalNotesSettingTab extends PluginSettingTab {
  plugin: HistoricalNotesPlugin;
  private translator: HistoricalNotesPlugin['translator'];

  constructor(app: App, plugin: HistoricalNotesPlugin) {
    // @ts-expect-error
    super(app, plugin);
    this.plugin = plugin;
    this.translator = plugin.translator;
  }

  display(): void {
    const { containerEl } = this;
    const t = (key: string) => this.translator.t(key);

    containerEl.empty();
    containerEl.createEl('h2', { text: t('settings.title') });

    new Setting(containerEl)
      .setName(t('settings.searchFolder.name'))
      .setDesc(t('settings.searchFolder.desc'))
      .addText((text) =>
        text
          .setPlaceholder(t('settings.searchFolder.placeholder'))
          .setValue(this.plugin.settings.searchFolder)
          .onChange(async (value) => {
            this.plugin.settings.searchFolder = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
