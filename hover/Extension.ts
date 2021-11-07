
import { Hover, languages, MarkdownString, Position, Range, TextDocument } from "vscode";

export async function activate () {
	const REGEX_WORD = /^\w+$/;
	const REGEX_INTERPOLATION_ARGUMENT = /\{\s*(\w+(?:\.\w+)*)\s*\}/;

	languages.registerHoverProvider("quilt", {
		provideHover (document, position, token) {
			const [type, range] = parseLine(document, position);
			switch (type) {
				case "dictionary": {
					const path = [
						...parsePath(document, position, getDictionaryLevel(document.getText(range))),
						document.getText(range).replace(/^#+ /, "").split("/")
					];

					return new Hover(new MarkdownString()
						.appendText("Dictionary:")
						.appendCodeblock(`# ${path.join("/")}`, "quilt"), range);
				}

				case "entry": {
					const path = [
						...parsePath(document, position),
						...document.getText(range).slice(0, -1).split("/"),
					];

					const translation = parseTranslation(document, range);
					const entry = path.pop();
					const md = new MarkdownString();

					if (path.length)
						md.appendText("Dictionary:")
							.appendCodeblock(`# ${path.join("/")}`, "quilt");

					return new Hover(md
						.appendText("Translation:")
						.appendCodeblock(`${entry}:${translation}`, "quilt"), range);
				}

				case "value": {
					let range = document.getWordRangeAtPosition(position, REGEX_INTERPOLATION_ARGUMENT);
					if (range)
						return providerInterpolationArgumentHover(document, position, range);

					range = document.getWordRangeAtPosition(position, /\{([^\{\}]*?(\{[^\{\}]*?\}[^\{\}]*?)?)*?\}/);
					if (range)
						return provideInterpolationHover(document, position, range);
				}
			}
		}
	});

	////////////////////////////////////
	// Parse Quilt
	//

	function parseLine (document: TextDocument, position: Position): ["dictionary" | "entry" | "value" | "comment", Range] {
		let result = parseDictionaryOrEntryFromLine(document, position);
		if (result)
			return result;

		let line = position.line + 1;
		while (!result && --line >= 0)
			result = parseDictionaryOrEntryFromLine(document, new Position(line, 0));

		const start = !result ? new Position(line, 0)
			: result[0] === "dictionary" ? new Position(line + 1, 0)
				: new Position(line, result[1].end.character);

		line = position.line;
		let nextResult: ReturnType<typeof parseDictionaryOrEntryFromLine> | undefined;
		while (!nextResult && ++line < document.lineCount)
			nextResult = parseDictionaryOrEntryFromLine(document, new Position(line, 0));

		const end = nextResult ? nextResult[1].start : new Position(line, 0);
		return [!result || result[0] === "dictionary" ? "comment" : "value", new Range(start, end)];
	}

	function parseDictionaryOrEntryFromLine (document: TextDocument, position: Position): ["dictionary" | "entry", Range] | undefined {
		let range = document.getWordRangeAtPosition(position, /^([\w-]+\/)*([\w-]+:)/);
		if (range)
			return ["entry", range];

		range = document.getWordRangeAtPosition(position, /^#+ [\w-]+(\/[\w-]+)*/);
		if (range)
			return ["dictionary", range];

		return undefined;
	}

	/**
	 * @param range The range of the entry as returned by {@link parseLine}
	 */
	function parseTranslation (document: TextDocument, range: Range) {
		let propertyEndLine = range.end.line;
		while (propertyEndLine < document.lineCount) {
			propertyEndLine++;
			if (document.getWordRangeAtPosition(new Position(propertyEndLine, 0), /^(#+ [\w-]+(\/[\w-]+)*|([\w-]+\/)*([\w-]+:))/)) {
				propertyEndLine--;
				break;
			}
		}

		return document.getText(new Range(range.end, new Position(propertyEndLine, Infinity)));
	}

	function parsePath (document: TextDocument, position: Position, dictionaryLevel = Infinity) {
		const path = [];
		while (dictionaryLevel > 1 && position.line > 0) {
			position = new Position(position.line - 1, 0);
			const range = document.getWordRangeAtPosition(position, /#+ [\w-]+(\/[\w-]+)*/);
			if (!range)
				continue;

			const text = document.getText(range);

			const sectionLevel = getDictionaryLevel(text);
			if (sectionLevel >= dictionaryLevel)
				continue;

			dictionaryLevel = sectionLevel;
			path.unshift(text.replace(/#+ /, ""));
		}

		return path;
	}

	function getDictionaryLevel (dictionary: string) {
		return dictionary.match(/#+/)?.[0].length ?? Infinity;
	}

	////////////////////////////////////
	// Interpolation hover
	//

	function providerInterpolationArgumentHover (document: TextDocument, position: Position, range: Range) {
		const argument = resolveArgument(document.getText(range));
		return new Hover(new MarkdownString().appendText("Interpolates the argument: ").appendCodeblock(argument, "javascript"), range);
	}

	function provideInterpolationHover (document: TextDocument, position: Position, range: Range) {
		return new Hover(new MarkdownString().appendCodeblock(document.getText(range), "quilt"), range);
	}

	////////////////////////////////////
	// Parse interpolation
	//

	function resolveArgument (text: string) {
		const [, argument] = text.match(REGEX_INTERPOLATION_ARGUMENT) ?? [];
		let argumentPath = argument.split(".")
			.map(argument => !isNaN(parseInt(argument)) ? `[${argument}]`
				: REGEX_WORD.test(argument) ? `.${argument}` : `["${argument}"]`);
		if (!argumentPath[0].startsWith("["))
			argumentPath.unshift("[0]");
		argumentPath.unshift("arguments")
		return argumentPath.join("");
	}

}

export function deactivate () { }
