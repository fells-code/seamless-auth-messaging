# Changesets

Add a changeset to every pull request that changes what adopters get:

```sh
npx changeset
```

Use the summary as the release note an adopter reads. Before 1.0, a breaking change is a minor
bump.

The three packages are a fixed group: they always share one version, and the transports depend
on the matching `@seamless-auth/messaging`. The release workflow turns merged changesets into a
`chore: version packages` pull request. Merging it publishes to npm with provenance, tags each
package, and creates the GitHub releases.
