using TallerMecanico.Models;

namespace TallerMecanico.Services;

public static class DevelopmentDataSeeder
{
    private static readonly (string Nombre, string Correo, string Rol)[] DemoUsers =
    [
        ("admin", "admin@taller.local", "Admin"),
        ("mecanico", "mecanico@taller.local", "Mecanico")
    ];

    public static async Task SeedAsync(TallerMecanicoDbContext context, AuthService auth)
    {
        foreach (var roleName in DemoUsers.Select(user => user.Rol).Distinct())
        {
            if (!context.Roles.Any(role => role.Nombre == roleName))
            {
                context.Roles.Add(new Role
                {
                    Nombre = roleName,
                    Descripcion = roleName == "Admin"
                        ? "Administrador del sistema con acceso total"
                        : "Mecánico u operador de taller"
                });
            }
        }

        await context.SaveChangesAsync();

        foreach (var (nombre, correo, rolNombre) in DemoUsers)
        {
            if (context.Usuarios.Any(usuario =>
                    usuario.Nombre == nombre || usuario.Correo == correo))
            {
                continue;
            }

            var role = context.Roles.Single(role => role.Nombre == rolNombre);
            var usuario = new Usuario
            {
                Nombre = nombre,
                Correo = correo,
                RolId = role.RolId
            };
            usuario.PasswordHash = auth.HashPassword(usuario, "Password123!");
            context.Usuarios.Add(usuario);
        }

        await context.SaveChangesAsync();
    }
}
