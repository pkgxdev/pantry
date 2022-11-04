export function overlay_this_pantry() {
  const self = new URL(import.meta.url).path().parent().parent().parent().join("projects")

  // if unset just assume the user wants this
  // this is magic in a bad way, but for now is what we're doing
  if (!!Deno.env.get("TEA_PANTRY_PATH")) {
    Deno.env.set("TEA_PANTRY_PATH", self.string)
  }
}
