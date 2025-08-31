import { lstat, readdir, readFile, writeFile } from 'node:fs/promises';
import ignore from 'ignore';


async function WeakRead(path: string) {
	try {
		return await readFile(path, 'utf8');
	} catch (_e) {
		return null;
	}
}

class Context {
	#parent?: Context;
	#rules ?: ignore.Ignore;

	readonly folder : string;
	readonly fullPath: string;

	constructor (folder: string, parent?: Context) {
		this.#parent = parent;

		this.fullPath = parent
			? parent.fullPath + folder
			: folder;
		this.folder = folder;
	}

	ignored (path: string): boolean {
		if (path === '.git') return false;
		if (path === 'node_modules') return false;

		if (this.#rules) {
			const test = this.#rules.test(path);
			if (test.ignored) {
				return true;
			}
		}

		if (!this.#parent) return false;

		return this.#parent.ignored(this.folder + path);
	}

	async barrel () {
		if (!this.#rules) {
			const rules = await WeakRead(this.fullPath + '.barrelignore');
			if (rules) this.#rules = ignore().add(rules)
		}

		const includes = new Array<{ namespace: string, path: string }>();
		for (const path of await readdir(this.fullPath)) {
			if (path.startsWith('.')) continue;
			if (path === 'node_modules') continue;
			if (path === 'mod.ts') continue;

			const stats = await lstat(this.fullPath + path);

			if (stats.isDirectory()) {
				const ctx = new Context(path+'/', this);
				const entry = await ctx.barrel();
				if (entry) includes.push({
					namespace: Namespace(path),
					path: path + '/mod.ts'
				});

				continue;
			}

			if (!stats.isFile()) continue;
			if (this.ignored(path)) continue;

			includes.push({ namespace: Namespace(path), path });
		}

		if (includes.length < 1) return false;

		let source = '';
		for (const file of includes) source += `export * as ${file.namespace} from './${file.path}';\n`;
		// source += '\nexport {'
		// for (const file of includes) source += `\n\t${file.namespace},`;
		// source += '\n}'

		await writeFile(this.fullPath+'mod.ts', source);

		return true;
	}
}

function Namespace(str: string) {
	const i = str.lastIndexOf('.');
	if (i !== -1) str = str.slice(0, i);

	if (str.length < 1) return '';

	let capital = true;
	let out = '';
	for (let i=0; i<str.length; i++) {
		if (!IsLetterNumber(str[i])) {
			capital = true;
			continue;
		}

		if (capital) {
			out += str[i].toUpperCase();
			capital = false;
		} else {
			out += str[i].toLowerCase();
		}
	}

	return out;
}

function IsLetterNumber(str: string) {
	const char = str.charCodeAt(0);
	if ('a'.charCodeAt(0) <= char && char <= 'z'.charCodeAt(0)) return true;
	if ('A'.charCodeAt(0) <= char && char <= 'Z'.charCodeAt(0)) return true;
	if ('0'.charCodeAt(0) <= char && char <= '9'.charCodeAt(0)) return true;

	return false;
}

const ctx = new Context('./');
await ctx.barrel();