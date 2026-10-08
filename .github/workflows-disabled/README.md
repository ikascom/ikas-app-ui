# Parked workflows

CI (`ci.yml`), release (`release.yml`) and Dependabot (`dependabot.yml`) live here while the repository is being set up, so pushes don't trigger them. GitHub only runs workflows from `.github/workflows/`.

To enable them:

```sh
git mv .github/workflows-disabled .github/workflows
git rm .github/workflows/README.md
git mv .github/workflows/dependabot.yml .github/dependabot.yml
```
