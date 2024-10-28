export class PluginSettingTab extends PluginSettingTab {
  plugin: YourPlugin;
  private translator: Translator;

  constructor(app: App, plugin: YourPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.translator = plugin.translator;
  }

  display(): void {
    const { containerEl } = this;
    const t = (key: TranslationKey) => this.translator.t(key);

    containerEl.empty();
    containerEl.createEl('h2', { text: t('settings.title') });

    new Setting(containerEl)
      .setName(t('settings.language.name'))
      .setDesc(t('settings.language.desc'))
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            'zh-CN': '中文',
            en: 'English',
          })
          .setValue(this.translator.getLocale()) // 获取当前语言
          .onChange(async (value: LocaleKey) => {
            // 保存到设置
            this.plugin.settings.language = value;
            await this.plugin.saveSettings();

            // 更新翻译器的语言设置
            this.translator.setLocale(value);

            // 刷新界面
            this.display();
          })
      );

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
