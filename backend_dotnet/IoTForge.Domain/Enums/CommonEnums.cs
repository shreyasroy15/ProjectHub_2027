namespace IoTForge.Domain.Enums;

public enum UserRole
{
    User = 1,
    Admin = 2
}

public enum ExperienceLevel
{
    Beginner = 1,
    Intermediate = 2,
    Advanced = 3
}

public enum ComponentCategory
{
    Microcontrollers = 1,
    Sensors = 2,
    Actuators = 3,
    Displays = 4,
    Communication = 5,
    Power = 6,
    Motors = 7,
    Modules = 8,
    Cables = 9,
    Accessories = 10
}

public enum DifficultyLevel
{
    Beginner = 1,
    Intermediate = 2,
    Advanced = 3,
    Expert = 4
}

public enum TestStatus
{
    Pending = 0,
    Passed = 1,
    Failed = 2,
    Skipped = 3
}

public enum ProjectStatus
{
    Draft = 1,
    InProgress = 2,
    Completed = 3,
    Archived = 4
}
