# Servidor estatico minimo para desarrollo local.
#   powershell -NoProfile -ExecutionPolicy Bypass -File serve.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8080

$types = @{
  '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'
  '.js'='application/javascript; charset=utf-8'; '.svg'='image/svg+xml'
  '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.png'='image/png'
  '.webp'='image/webp'; '.ico'='image/x-icon'; '.json'='application/json'
  '.woff2'='font/woff2'; '.mp4'='video/mp4'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Nutrete -> http://localhost:$port  (Ctrl+C para detener)"

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
  if ([string]::IsNullOrWhiteSpace($rel)) { $rel = 'index.html' }
  $path = Join-Path $root ($rel -replace '/', '\')

  # No servir nada fuera de la carpeta del proyecto.
  $full = [System.IO.Path]::GetFullPath($path)
  if (-not $full.StartsWith([System.IO.Path]::GetFullPath($root), 'OrdinalIgnoreCase')) {
    $ctx.Response.StatusCode = 403; $ctx.Response.Close(); continue
  }

  if (Test-Path $full -PathType Leaf) {
    $bytes = [System.IO.File]::ReadAllBytes($full)
    $ext = [System.IO.Path]::GetExtension($full).ToLower()
    $ctx.Response.ContentType = $(if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' })
    $ctx.Response.Headers.Add('Cache-Control', 'no-store, no-cache, must-revalidate')
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    Write-Host "200 /$rel"
  } else {
    $ctx.Response.StatusCode = 404
    Write-Host "404 /$rel"
  }
  $ctx.Response.Close()
}
