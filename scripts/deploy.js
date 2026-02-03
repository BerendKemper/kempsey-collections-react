import child_process from "child_process";
import { writeFileSync, mkdirSync, rmSync, cpSync } from "fs";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { promisify } from 'util';

const execAsync = promisify(child_process.exec);

const run = cmd => child_process.execSync(cmd, { stdio: `inherit` });

const application = {
  async currentBranch() {
    const { stdout, stderr } = await execAsync(`git branch --show-current`);
    if (stderr) throw new Error(`Unexpected error at "git branch --show-current"\n${stderr}`);
    return stdout.trim();
  },

  async checkDirtyTree() {
    const { stdout, stderr } = await execAsync(`git diff --quiet`);
    console.log(`checkDirtyTree`, stdout, stderr);
  },
  async typescript() {
    const { stdout, stderr } = await execAsync(`tsc -b`);
    console.log(`typescript`, stdout, stderr);
  },
  async build() {
    const { stdout, stderr } = await execAsync(`vite build`);
    console.log(`build`, stdout, stderr);
  },
  /** GitHub pages requires a CNAME to point to my domain */
  async makeCNAME() {
    const cnamePath = path.join(`dist`, `CNAME`);
    await fs.promises.mkdir(path.dirname(cnamePath), { recursive: true });
    await fs.promises.writeFile(cnamePath, `emperjs.com`, `utf-8`);
  },
  async process() {
    // --- check current branch
    const currentBranch = await this.currentBranch();
    if (currentBranch !== `main`) {
      throw new Error(`Deploy aborted: you must be on 'main' branch, current branch is '${currentBranch}'`);
    }

    /** optional but wise: refuse to deploy with dirty tree. Explanation: if there are uncommitted changes it's not allowed to deploy. */
    await execAsync(`git diff --quiet`);

    // --- build
    await this.typescript();
    await this.build();

    // --- DNS requirement
    await this.makeCNAME();

    // // 1. Switch to gh-pages
    await execAsync(`git checkout gh-pages`);

    // 2. Undo last (and only) commit safely
    await execAsync(`git reset --soft HEAD`);

    // 3. Copy dist/* recursive to root
    await fs.promises.cp(`dist`, `.`, { recursive: true });

    // 4. Stage + amend into a single commit
    await execAsync(`git add .`);
    await execAsync(`git commit --amend -m "Deploy site"`);

    // 5. Force push
    await execAsync(`git push origin gh-pages --force`);
    await execAsync(`git checkout main`);
  }
};
application.process();
