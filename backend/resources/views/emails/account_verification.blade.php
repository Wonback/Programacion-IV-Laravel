<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Verifica tu cuenta</title>
<style>
  body { font-family: Arial, sans-serif; background: #f8f9fa; text-align: center; padding: 40px; }
  .card { background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 3px 10px rgba(0,0,0,0.1); display: inline-block; }
  .btn { display: inline-block; background: #007bff; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; }
  .btn:hover { background: #0056b3; }
</style>
</head>
<body>
  <div class="card">
    <h2>¡Hola {{ $user->name }}!</h2>
    <p>Gracias por registrarte. Para activar tu cuenta y convertirte en administrador, haz clic en el siguiente botón:</p>
    <a href="{{ $verifyUrl }}" class="btn">Verificar cuenta</a>
  </div>
</body>
</html>
