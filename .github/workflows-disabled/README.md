# Parked workflows

CI (`ci.yml`) and release (`release.yml`) live here while the repository is being set up, so pushes don't trigger them. GitHub only runs workflows from `.github/workflows/`.

To enable them:

```sh
git mv .github/workflows-disabled .github/workflows
git rm .github/workflows/README.md
```
