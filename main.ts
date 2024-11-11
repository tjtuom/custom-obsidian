import {
	App,
	MarkdownPostProcessorContext,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface TjTuomPluginSettings {
	flashCardSeparator: string;
}

const DEFAULT_SETTINGS: TjTuomPluginSettings = {
	flashCardSeparator: "???",
};

export default class TjTuomPlugin extends Plugin {
	settings: TjTuomPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TjTuomSettingsTab(this.app, this));

		this.registerMarkdownPostProcessor((el, ctx) =>
			this.removeFlashCardQuestions(el, ctx),
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private removeFlashCardQuestions(
		element: HTMLElement,
		_ctx: MarkdownPostProcessorContext,
	): void {
		const elems = element.findAll("p");

		for (const elem of elems) {
			const idx = elem.innerHTML.indexOf(this.settings.flashCardSeparator);
			if (idx !== -1) {
				elem.innerHTML = elem.innerHTML.substring(
					idx + this.settings.flashCardSeparator.length,
				);
				elem.querySelector("br:first-child")?.remove();
			}
		}
	}
}

class TjTuomSettingsTab extends PluginSettingTab {
	plugin: TjTuomPlugin;

	constructor(app: App, plugin: TjTuomPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Flashcard separator")
			.setDesc("String used as the separator for multiline cards")
			.addText((text) =>
				text
					.setPlaceholder("")
					.setValue(this.plugin.settings.flashCardSeparator)
					.onChange(async (value) => {
						this.plugin.settings.flashCardSeparator = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
