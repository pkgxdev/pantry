import * as fs from "node:fs"

interface Package {
  project: string,
  birthtime: Date,
  name?: string
  description?: string
  labels?: string[]
}

export async function getKettleRemoteMetadata() {
  const headers = { Authorization: 'public' }
  const rsp = await fetch(`https://app.pkgx.dev/v1/packages/`, {headers})
  const foo = await rsp.json() as {project: string, short_description: string}[]
  return foo.reduce((acc, {project, short_description}) => {
    acc[project] = short_description
    return acc
  }, {} as Record<string, string>)
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

      let description: string | undefined = descriptions[project]?.trim()
      if (!description) description = undefined

      let labels: string[] | undefined = [...await get_labels(line)]
      if (labels.length == 0) labels = undefined

      rv.push({ project, birthtime, name, description, labels })
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
import get_pkg_name from "https://raw.githubusercontent.com/pkgxdev/www/main/src/utils/pkg-name.ts";

async function get_name(path: string, project: string): Promise<string | undefined> {
  const txt = await Deno.readTextFileSync(path)
  const yml = await parse(txt) as Record<string, any>
  if (yml['display-name']) {
    return yml['display-name']
  } else if (isArray(yml.provides) && yml.provides.length == 1) {
    return yml.provides[0].slice(4)
  } else {
    return get_pkg_name(project)
  }
}

import { parse_pkgs_node } from "pkgx/hooks/usePantry.ts"

async function get_labels(path: string) {
  const txt = await Deno.readTextFileSync(path)
  const yml = await parse(txt) as Record<string, any>
  const deps = parse_pkgs_node(yml.dependencies) //NOTE will ignore other platforms than linux, but should be fine

  const labels = new Set<string>(deps.compact(({ project }) => {
    switch (project) {
    case 'nodejs.org':
    case 'npmjs.com':
      return 'node'
    case 'python.org':
    case 'pip.pypa.io':
      return 'python'
    case 'ruby-lang.org':
    case 'rubygems.org':
      return 'ruby'
    case 'rust-lang.org':
    case 'rust-lang.org/cargo':
      return 'rust'
    }
  }))

  for (const dep of parse_pkgs_node(yml.build.dependencies)) {
    switch (dep.project) {
    case 'rust-lang.org':
    case 'rust-lang.org/cargo':
      labels.add('rust')
      break
    case 'go.dev':
      labels.add('go')
    }
  }

  return labels
}
