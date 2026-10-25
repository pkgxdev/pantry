#!/usr/bin/env bash
# finds (or reopens, or creates) the build-failure issue for $PKG and logs this failure on it
# DRY_RUN=1 prints the writes instead of making them
set -euo pipefail

TITLE="❌ build issues: $PKG"
LOGS="$GITHUB_SERVER_URL/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID/attempts/${GITHUB_RUN_ATTEMPT:-1}"
TRIAGE_LABELS='["gha-issue","404","version-lockstep-required"]'

write() {
  if [ -n "${DRY_RUN:-}" ]; then
    echo "DRY_RUN: gh $*" >&2
    echo 0
  else
    gh "$@"
  fi
}

# exact-title matches as "number state state_reason", oldest first.
# the REST list is consistent immediately (sees issues created seconds ago);
# search reaches older issues, but its index lags, so it can't be the only source.
matches() {
  {
    gh api "repos/$GITHUB_REPOSITORY/issues?labels=build-failure&state=all&sort=created&direction=desc&per_page=100" --jq '.[]'
    gh api -X GET search/issues \
      -f q="repo:$GITHUB_REPOSITORY is:issue label:build-failure in:title \"$TITLE\"" \
      -f per_page=100 --jq '.items[]' ||
      echo "::warning::issue search failed; only recent issues were checked" >&2
  } | jq -rs --arg t "$TITLE" '
    map(select(.title == $t and .pull_request == null))
    | unique_by(.number) | .[]
    | "\(.number) \(.state) \(.state_reason // "")"'
}

oldest_open() { awk '$2 == "open" { print $1; exit }'; }

found=$(matches)
issue=$(oldest_open <<<"$found")
note=""

if [ -z "$issue" ]; then
  read -r closed reason < <(awk '$2 == "closed" { n = $1; r = $3 } END { print n, r }' <<<"$found")
  if [ -n "$closed" ] && [ "$reason" != "not_planned" ]; then
    # closed as transient (gha-issue, 404…) or fixed; it failed again, so reopen it.
    # drop the triage label so applying it again closes the issue again
    issue=$closed
    write api -X PATCH "repos/$GITHUB_REPOSITORY/issues/$issue" -f state=open >/dev/null
    for label in $(gh api "repos/$GITHUB_REPOSITORY/issues/$issue/labels" \
      --jq ".[].name | select(IN(${TRIAGE_LABELS}[]))"); do
      write api -X DELETE "repos/$GITHUB_REPOSITORY/issues/$issue/labels/$label" >/dev/null
    done
    note="Reopened: this failed again after the issue was closed."
  elif [ -n "$closed" ]; then
    # closed as not planned (yanked, old-version): log it there without reopening
    issue=$closed
  else
    issue=$(write api "repos/$GITHUB_REPOSITORY/issues" \
      -f title="$TITLE" \
      -f body="Running log of build failure for $PKG" \
      -f labels[]=build-failure \
      -f assignees[]=jhheider \
      --jq '.number')

    # another platform's complain job may have created one at the same moment;
    # the oldest open issue wins and the rest close as duplicates
    sleep $(( 5 + RANDOM % 10 ))
    winner=$(matches | oldest_open)
    if [ -n "$winner" ] && [ "$winner" != "$issue" ]; then
      write api "repos/$GITHUB_REPOSITORY/issues/$issue/comments" -f body="Duplicate of #$winner" >/dev/null
      write api -X PATCH "repos/$GITHUB_REPOSITORY/issues/$issue" \
        -f state=closed -f state_reason=not_planned >/dev/null
      issue=$winner
    fi
  fi
fi

echo "logging to #$issue" >&2
write api "repos/$GITHUB_REPOSITORY/issues/$issue/comments" -f body="# Build failure
## $PKG${PLATFORM:+ ($PLATFORM)}
${note:+
$note
}
logs: $LOGS" >/dev/null
