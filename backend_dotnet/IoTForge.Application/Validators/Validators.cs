using FluentValidation;
using IoTForge.Application.DTOs;

namespace IoTForge.Application.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required").MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("A valid email address is required");
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6).WithMessage("Password must be at least 6 characters");
        RuleFor(x => x.ConfirmPassword).Equal(x => x.Password).WithMessage("Passwords do not match");
    }
}

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public class CreateProjectRequestValidator : AbstractValidator<CreateProjectRequest>
{
    public CreateProjectRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
    }
}

public class ProjectGenerationRequestValidator : AbstractValidator<ProjectGenerationRequest>
{
    public ProjectGenerationRequestValidator()
    {
        RuleFor(x => x.Prompt).NotEmpty().MinimumLength(5).WithMessage("Please describe what IoT project you want to build.");
    }
}

public class CreateComponentRequestValidator : AbstractValidator<CreateComponentRequest>
{
    public CreateComponentRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.EstimatedPrice).GreaterThanOrEqualTo(0);
    }
}
