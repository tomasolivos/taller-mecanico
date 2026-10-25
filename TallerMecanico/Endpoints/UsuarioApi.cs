using TallerMecanico.Models;
using TallerMecanico.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TallerMecanico.ValidacionesDTO;
using Microsoft.AspNetCore.Authorization;
using TallerMecanico.Repositories;
using System.ComponentModel.DataAnnotations;

namespace TallerMecanico.Endpoints
{
    public static class UsuarioApi
    {
        public static void MapUsuarioApi(this WebApplication app)
        {
            var user = app.MapVersionedV1Group("usuarios", "Usuarios");

            user.MapPost("/registro", async (RegistroRequest request, [Microsoft.AspNetCore.Mvc.FromServices] IUsuarioRepository usuarioRepo, [Microsoft.AspNetCore.Mvc.FromServices] IRolRepository rolRepo, AuthService auth) => {
                    if (request.Validar() is { } errorDeValidacion) return errorDeValidacion;

                    var roles = await rolRepo.FindAsync(rol => rol.Nombre == "Mecanico");
                    var rolMecanico = roles.SingleOrDefault();
                    if (rolMecanico is null) return Results.Problem("El rol predeterminado no está configurado.", statusCode: StatusCodes.Status500InternalServerError);

                    var usuario = new Usuario
                    {
                        Nombre = request.Nombre,
                        Correo = request.Correo,
                        RolId = rolMecanico.RolId
                    };

                    usuario.PasswordHash = auth.HashPassword(usuario, request.Password);
                    await usuarioRepo.AddAsync(usuario);
                    await usuarioRepo.SaveChangesAsync();
                    
                    return Results.Created($"/api/v1/usuarios/{usuario.UsuarioId}", new { usuario.UsuarioId, usuario.Nombre, usuario.Correo });
                }).AllowAnonymous();

            user.MapPost("/login", async (LoginRequest login, [Microsoft.AspNetCore.Mvc.FromServices] IUsuarioRepository usuarioRepo,
                IConfiguration config, AuthService auth) =>
            {
                if (login.Validar() is { } errorDeValidacion) return errorDeValidacion;

                var usuario = await usuarioRepo.GetUsuarioConRolByNombreAsync(login.NombreUsuario);
                if (usuario is null)
                    return Results.Unauthorized();

                var resultado = auth.VerifyPassword(usuario, login.Password);
                if (resultado == PasswordVerificationResult.Failed)
                    return Results.Unauthorized();

                var claims = new List<Claim>()
                {
                    new Claim(ClaimTypes.Name, usuario.Nombre),
                    new Claim(ClaimTypes.Role, usuario.Rol.Nombre)

                };
                var jwtKey = config["Jwt:Key"];
                var jwtIssuer = config["Jwt:Issuer"];
                var jwtAudience = config["Jwt:Audience"];
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                    jwtKey ?? throw new InvalidOperationException("Jwt:Key is missing.")));
                var credenciales = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
                var token = new JwtSecurityToken(
                    issuer: jwtIssuer,
                    audience: jwtAudience,
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(5),
                    signingCredentials: credenciales
                );

                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
                return Results.Ok(new 
                { 
                    token = tokenString,
                    usuario = new 
                    {
                        usuarioId = usuario.UsuarioId,
                        nombre = usuario.Nombre,
                        correo = usuario.Correo,
                        rol = usuario.Rol.Nombre
                    }
                });
            })
            .AllowAnonymous()
            .RequireRateLimiting("LoginRateLimit");
        }
        public record LoginRequest(
            [property: Required(ErrorMessage = "El nombre de usuario es obligatorio.")]
            [property: MinLength(3, ErrorMessage = "El nombre de usuario debe tener al menos 3 caracteres.")]
            string NombreUsuario,
            [property: Required(ErrorMessage = "La contraseña es obligatoria.")]
            [property: MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres.")]
            string Password);
    }
}

