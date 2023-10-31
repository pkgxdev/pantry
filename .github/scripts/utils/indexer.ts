import * as fs from "node:fs"

interface Package {
  project: string,
  birthtime: Date,
  name?: string
  description?: string
}

export async function getKettleRemoteMetadata(): Promise<Record<string, string>> {
  const headers = { Authorization: 'public' }
  const rsp = await fetch(`https://app.pkgx.dev/v1/packages/`, {headers})
  const foo = await rsp.json() as {project: string, short_description: string}[]
  return foo.reduce((acc, {project, short_description}) => {
    acc[project] = short_description
    return acc
  }, {})
}

const descriptions = await getKettleRemoteMetadata();

async function getPackageYmlCreationDates(): Promise<Package[]> {
  const cmdString = "git log --pretty=format:'%H %aI' --name-only --diff-filter=A -- '**/package.yml'";
  const process = Deno.run({
    cmd: ["bash", "-c", cmdString],
    stdout: "piped",
  });

  const output = new TextDecoder().decode(await process.output());
  await process.status();
  process.close();

  const lines = output.trim().split('\n');
  const rv: Package[] = []
  let currentCommitDate: string | null = null;

  for (const line of lines) {
    if (line.includes(' ')) {  // Detect lines with commit hash and date
      currentCommitDate = line.split(' ')[1];
    } else if (line.endsWith('package.yml')) {
      const project = line.slice(9, -12)

      if (!fs.existsSync(line)) {
        // the file used to exist but has been deleted
        console.warn("skipping yanked: ", project)
        continue
      }

      const birthtime = new Date(currentCommitDate!)
      const name = await get_name(line, project)
      const description = descriptions[project]

      rv.push({ project, birthtime, name, description })
    }
  }

  return rv;
}

const pkgs = await getPackageYmlCreationDates();

// sort by birthtime
pkgs.sort((a, b) => b.birthtime.getTime() - a.birthtime.getTime());

console.log(JSON.stringify(pkgs, null, 2));

//////////////////////////////////////////////////////
import { parse } from "https://deno.land/std@0.204.0/yaml/mod.ts";
import { isArray } from "https://deno.land/x/is_what@v4.1.15/src/index.ts";

async function get_name(path: string, project: string): Promise<string | undefined> {
  const txt = await Deno.readTextFileSync(path)
  const yml = await parse(txt) as Record<string, any>
  if (yml['display-name']) {
    return yml['display-name']
  } else if (isArray(yml.provides) && yml.provides.length == 1) {
    return yml.provides[0].slice(4)
  } else if (project.startsWith("github.com")) {
    return project.slice(11)
  }
}
