import { App, ISuggestOwner, Scope } from 'obsidian';

export abstract class TextInputSuggest<T> implements ISuggestOwner<T> {
  protected app: App;
  protected inputEl: HTMLInputElement;

  private popper: any;
  private scope: Scope;
  private suggestEl: HTMLElement;
  private suggestions: T[];
  private selectedItem: number;
  private containerEl: HTMLElement;

  constructor(app: App, inputEl: HTMLInputElement) {
    this.app = app;
    this.inputEl = inputEl;
    this.scope = new Scope();

    this.containerEl = createDiv('suggestion-container');
    const suggestion = this.containerEl.createDiv('suggestion');
    this.suggestEl = suggestion.createDiv('suggestion-list');

    this.scope.register([], 'Escape', this.close.bind(this));

    this.inputEl.addEventListener('input', this.onInputChanged.bind(this));
    this.inputEl.addEventListener('focus', this.onInputChanged.bind(this));
    this.inputEl.addEventListener('blur', this.close.bind(this));
    this.suggestEl.on('mousedown', '.suggestion-item', (event, el) => {
      event.preventDefault();
      const item = this.suggestions[Number(el.dataset.index)];
      this.selectSuggestion(item);
    });
  }

  onInputChanged(): void {
    const inputStr = this.inputEl.value;
    const suggestions = this.getSuggestions(inputStr);

    if (!suggestions) {
      this.close();
      return;
    }

    this.suggestions = suggestions;
  }

  close(): void {
    this.containerEl?.detach();
  }

  abstract getSuggestions(inputStr: string): T[];
  abstract renderSuggestion(item: T, el: HTMLElement): void;
  abstract selectSuggestion(item: T): void;
}
