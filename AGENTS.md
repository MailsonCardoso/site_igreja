## Workflow

Após qualquer alteração no código, sempre execute:

1. **Rebuild**: `npm run build`
2. **Versionamento**: Incremente a versão no `package.json` (patch `0.0.x`)
3. **Commit e Push**:
   - `git add .`
   - `git commit -m "tipo(escopo): descrição"`
   - `git tag v0.0.x`
   - `git push origin main --tags`
