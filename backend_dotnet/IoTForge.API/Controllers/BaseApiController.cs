using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace IoTForge.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected Guid CurrentUserId
    {
        get
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (Guid.TryParse(sub, out var id))
            {
                return id;
            }
            throw new UnauthorizedAccessException("User is not authenticated or claims are invalid.");
        }
    }
}
