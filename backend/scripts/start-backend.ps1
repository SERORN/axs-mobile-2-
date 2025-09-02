# Arranca Nest en 3001 en modo watch
param(
  [string]$ProjectPath = "C:\Users\clvme\Desktop\Lukas\Proyectos\axs-mobile (2)\backend"
)

Set-Location $ProjectPath
$env:NODE_ENV = "development"
$env:PORT = "3001"
npm run start:dev
