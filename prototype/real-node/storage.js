const fs = require("fs");
const path = require("path");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

class JsonStateStore {
  constructor(baseDir) {
    this.baseDir = baseDir;
    ensureDir(baseDir);
  }

  file(name) {
    return path.join(this.baseDir, `${name}.json`);
  }

  load(name, fallback) {
    const f = this.file(name);
    if (!fs.existsSync(f)) return fallback;
    return JSON.parse(fs.readFileSync(f, "utf8"));
  }

  save(name, value) {
    fs.writeFileSync(this.file(name), JSON.stringify(value, null, 2));
  }

  append(name, item) {
    const arr = this.load(name, []);
    arr.push(item);
    this.save(name, arr);
    return arr;
  }

  clear() {
    fs.rmSync(this.baseDir, { recursive: true, force: true });
    ensureDir(this.baseDir);
  }
}

module.exports = {
  JsonStateStore,
};
